
// State Management
const STATE_KEY = 'uni_transport_data';
const MQTT_BROKER = 'broker.hivemq.com';
const MQTT_PORT = 8000;
const MQTT_TOPIC = 'unitransport/sreemangal/updates';

// Sreemangal Coordinates
const LOCATIONS = {
    town: { lat: 24.3065, lng: 91.7296 }, // Sreemangal Town
    uni: { lat: 24.3120, lng: 91.7350 }   // Placeholder Uni location nearby
};

class App {
    constructor() {
        this.role = null;
        this.driverState = {
            active: false,
            direction: null,
            route: null,
            id: 'driver_' + Math.random().toString(36).substr(2, 9),
            interval: null,
            progress: 0
        };
        this.studentState = {
            filterDirection: 'town_to_uni',
            filterRoute: '',
            map: null,
            markers: {},
            buses: {} // Local cache of buses from MQTT
        };

        this.mqttClient = null;
        this.init();
    }

    init() {
        // Connect to MQTT
        this.connectMQTT();

        // Register Service Worker Features
        this.registerSWFeatures();

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    async registerSWFeatures() {
        if ('serviceWorker' in navigator) {
            try {
                const reg = await navigator.serviceWorker.ready;

                // Request Notification Permission
                if ('Notification' in window && Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        console.log('Notifications granted');
                    }
                }

                // Register Background Sync
                if ('sync' in reg) {
                    await reg.sync.register('sync-location');
                    console.log('Background Sync registered');
                }

                // Register Periodic Sync (if supported)
                if ('periodicSync' in reg) {
                    const status = await navigator.permissions.query({
                        name: 'periodic-background-sync',
                    });
                    if (status.state === 'granted') {
                        await reg.periodicSync.register('update-schedule', {
                            minInterval: 24 * 60 * 60 * 1000, // 1 day
                        });
                        console.log('Periodic Sync registered');
                    }
                }
            } catch (e) {
                console.log('SW Features Error:', e);
            }
        }
    }

    connectMQTT() {
        const clientId = 'client_' + Math.random().toString(36).substr(2, 9);
        this.mqttClient = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, clientId);

        this.mqttClient.onConnectionLost = (responseObject) => {
            console.log("Connection Lost: " + responseObject.errorMessage);
            setTimeout(() => this.connectMQTT(), 5000); // Reconnect
        };

        this.mqttClient.onMessageArrived = (message) => {
            const payload = JSON.parse(message.payloadString);
            this.handleMQTTMessage(payload);
        };

        this.mqttClient.connect({
            onSuccess: () => {
                console.log("MQTT Connected");
                this.mqttClient.subscribe(MQTT_TOPIC);
            },
            useSSL: false
        });
    }

    handleMQTTMessage(data) {
        if (this.role === 'student') {
            // Update local cache
            this.studentState.buses[data.id] = data;
            this.updateStudentMap();
        }
    }

    broadcastLocation(lat, lng) {
        if (!this.mqttClient || !this.mqttClient.isConnected()) return;

        const payload = {
            id: this.driverState.id,
            route: this.driverState.route,
            direction: this.driverState.direction,
            lat: lat,
            lng: lng,
            lastUpdate: Date.now()
        };

        const message = new Paho.MQTT.Message(JSON.stringify(payload));
        message.destinationName = MQTT_TOPIC;
        this.mqttClient.send(message);
    }

    // --- Navigation ---

    setRole(role) {
        this.role = role;
        this.hideAllViews();
        if (role === 'driver') {
            document.getElementById('view-driver-dashboard').classList.remove('hidden');
        } else {
            document.getElementById('view-student-dashboard').classList.remove('hidden');
            this.initMap();
        }
    }

    hideAllViews() {
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    }

    // --- Driver Logic ---

    setDirection(dir) {
        this.driverState.direction = dir;
        this.updateDriverUI();
    }

    setRoute(num) {
        this.driverState.route = num;
        this.updateDriverUI();
    }

    updateDriverUI() {
        // Visual feedback for direction
        document.querySelectorAll('.dir-btn').forEach(el => {
            el.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
            el.classList.add('border-gray-200');
        });
        if (this.driverState.direction) {
            const btn = this.driverState.direction === 'town_to_uni' ? document.getElementById('btn-dir-tu') : document.getElementById('btn-dir-ut');
            btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
            btn.classList.remove('border-gray-200');
        }

        // Visual feedback for route
        document.querySelectorAll('.route-btn').forEach(el => {
            el.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
            if (parseInt(el.dataset.route) === this.driverState.route) {
                el.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
            }
        });

        // Enable start button
        const startBtn = document.getElementById('btn-start-driving');
        if (this.driverState.direction && this.driverState.route) {
            startBtn.disabled = false;
        }
    }

    startDriving() {
        this.driverState.active = true;
        document.getElementById('driver-active-panel').classList.remove('hidden');
        document.getElementById('btn-start-driving').parentElement.classList.add('hidden'); // Hide config

        // Try to use real GPS
        if ("geolocation" in navigator) {
            this.driverState.interval = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.broadcastLocation(latitude, longitude);
                },
                (error) => {
                    console.error("GPS Error, falling back to simulation", error);
                    this.startSimulation();
                },
                { enableHighAccuracy: true }
            );
        } else {
            this.startSimulation();
        }
    }

    startSimulation() {
        // Fallback simulation if GPS fails or denied
        this.driverState.progress = 0;
        this.driverState.interval = setInterval(() => {
            this.simulateMovement();
        }, 1000);
    }

    stopDriving() {
        this.driverState.active = false;
        if (typeof this.driverState.interval === 'number') {
            // It's an interval ID (simulation) or watch ID (GPS)
            // Clear both to be safe
            clearInterval(this.driverState.interval);
            navigator.geolocation.clearWatch(this.driverState.interval);
        }

        // Reset UI
        document.getElementById('driver-active-panel').classList.add('hidden');
        document.getElementById('btn-start-driving').parentElement.classList.remove('hidden');
    }

    simulateMovement() {
        // Simple linear interpolation between town and uni
        this.driverState.progress += 0.01; // 1% per second
        if (this.driverState.progress > 1) this.driverState.progress = 0; // Loop

        const start = this.driverState.direction === 'town_to_uni' ? LOCATIONS.town : LOCATIONS.uni;
        const end = this.driverState.direction === 'town_to_uni' ? LOCATIONS.uni : LOCATIONS.town;

        const currentLat = start.lat + (end.lat - start.lat) * this.driverState.progress;
        const currentLng = start.lng + (end.lng - start.lng) * this.driverState.progress;

        this.broadcastLocation(currentLat, currentLng);
    }

    // --- Student Logic ---

    setStudentFilter(dir) {
        this.studentState.filterDirection = dir;

        // UI Update
        document.getElementById('st-filter-tu').classList.toggle('bg-indigo-600', dir === 'town_to_uni');
        document.getElementById('st-filter-tu').classList.toggle('text-white', dir === 'town_to_uni');
        document.getElementById('st-filter-ut').classList.toggle('bg-indigo-600', dir === 'uni_to_town');
        document.getElementById('st-filter-ut').classList.toggle('text-white', dir === 'uni_to_town');

        this.updateStudentMap();
    }

    setStudentRoute(route) {
        this.studentState.filterRoute = route ? parseInt(route) : '';
        this.updateStudentMap();
    }

    initMap() {
        if (this.studentState.map) return;

        this.studentState.map = L.map('map').setView([LOCATIONS.town.lat, LOCATIONS.town.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.studentState.map);

        // Add static markers for Town and Uni
        L.marker([LOCATIONS.town.lat, LOCATIONS.town.lng]).addTo(this.studentState.map).bindPopup("Sreemangal Town");
        L.marker([LOCATIONS.uni.lat, LOCATIONS.uni.lng]).addTo(this.studentState.map).bindPopup("University");
    }

    updateStudentMap() {
        if (this.role !== 'student') return;

        const buses = Object.values(this.studentState.buses);
        const listEl = document.getElementById('buses-list');
        listEl.innerHTML = '';

        // Filter buses
        const activeBuses = buses.filter(bus => {
            // Filter out stale data (> 30 seconds old)
            if (Date.now() - bus.lastUpdate > 30000) return false;

            // Apply user filters
            if (this.studentState.filterDirection && bus.direction !== this.studentState.filterDirection) return false;
            if (this.studentState.filterRoute && bus.route !== this.studentState.filterRoute) return false;

            return true;
        });

        // Update Map Markers
        // Remove old markers
        Object.keys(this.studentState.markers).forEach(id => {
            if (!activeBuses.find(b => b.id === id)) {
                this.studentState.map.removeLayer(this.studentState.markers[id]);
                delete this.studentState.markers[id];
            }
        });

        let nearestBus = null;
        let minDistance = Infinity;

        activeBuses.forEach(bus => {
            // Update or create marker
            if (this.studentState.markers[bus.id]) {
                this.studentState.markers[bus.id].setLatLng([bus.lat, bus.lng]);
            } else {
                const marker = L.marker([bus.lat, bus.lng], {
                    icon: L.divIcon({
                        className: 'bg-transparent',
                        html: `<div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">${bus.route}</div>`
                    })
                }).addTo(this.studentState.map);
                this.studentState.markers[bus.id] = marker;
            }

            // Calculate distance to Town (simplified)
            const dist = Math.sqrt(Math.pow(bus.lat - LOCATIONS.town.lat, 2) + Math.pow(bus.lng - LOCATIONS.town.lng, 2));
            if (dist < minDistance) {
                minDistance = dist;
                nearestBus = bus;
            }

            // Add to list
            const item = document.createElement('div');
            item.className = 'p-4 bg-white rounded-xl border border-gray-100 flex justify-between items-center shadow-sm';
            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        ${bus.route}
                    </div>
                    <div>
                        <p class="font-bold text-gray-800">Route ${bus.route}</p>
                        <p class="text-xs text-gray-500">Towards ${bus.direction === 'town_to_uni' ? 'University' : 'Town'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-emerald-600">Live</p>
                </div>
            `;
            listEl.appendChild(item);
        });

        if (activeBuses.length === 0) {
            listEl.innerHTML = '<div class="p-4 bg-white rounded-xl border border-gray-100 text-center text-gray-400 text-sm">No buses currently active on this route.</div>';
            document.getElementById('map-overlay').classList.add('hidden');
        } else if (nearestBus) {
            // Update overlay
            document.getElementById('map-overlay').classList.remove('hidden');
            document.getElementById('bus-info-display').innerText = `Route ${nearestBus.route}`;
            // Rough estimation: 1 degree lat is ~111km. 
            const km = (minDistance * 111).toFixed(1);
            document.getElementById('distance-display').innerText = `${km} km away`;

            // ETA (assuming 30km/h speed -> 0.5km/min)
            const mins = Math.ceil(km * 2);
            document.getElementById('eta-display').innerText = `${mins} mins away`;
        }
    }
}

// Initialize
const app = new App();
// Expose to window for HTML onclick handlers
window.app = app;
