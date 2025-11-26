# UniTransport App Prototype

This is a mobile-responsive web application prototype for the University Transportation system.

## Features
- **Dual Interface**: Role selection for Drivers and Students.
- **Driver Mode**: Select route and direction, then "Start Journey" to broadcast location.
- **Student Mode**: View active buses on a map, filter by route/direction, and see estimated time of arrival.
- **Real-time Sync**: Uses local storage to simulate real-time data synchronization between the Driver and Student interfaces.

## How to Run
1. Navigate to the `uni-transport-app` folder.
2. Open `index.html` in your web browser.
3. **To test the Real-time Sync**:
   - Open `index.html` in a **second tab** or window.
   - In Tab 1, select **Driver**, choose a route, and click **Start Journey**.
   - In Tab 2, select **Student**. You should see the bus appear on the map and move in real-time!

## Technologies
- **HTML5/JS**: Core logic and structure.
- **Tailwind CSS**: Modern, responsive styling.
- **Leaflet.js**: Interactive maps.
- **LocalStorage**: Simulates a backend database for data synchronization.

## Note
Since this is a prototype running without a backend server, the data is stored in your browser's local storage. Click the "Reset App" button in the header to clear any stuck data.
