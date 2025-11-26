# UniTransport - Production Release

This is the production-ready version of the University Transportation App, configured for **Sreemangal, Bangladesh**.

## 🚀 Features
- **Real-Time Sync**: Uses **MQTT (HiveMQ Public Broker)** to sync driver locations to all 1000+ students instantly. No backend server required.
- **Real GPS**: Drivers broadcast their *actual* physical location using their phone's GPS.
- **Scalable**: Architecture supports thousands of concurrent users.
- **Offline Ready**: Works as a PWA even with spotty internet.

## 📱 How to Install on Phones (APK / App)

Since this is a modern Web Application, you have two ways to install it:

### Option A: The "Native" Way (Recommended)
1. Host this folder on a static site provider.
   - **Easiest**: Go to [Netlify Drop](https://app.netlify.com/drop).
   - Drag and drop the `uni-transport-app` folder there.
   - You will get a public URL (e.g., `https://uni-transport-sreemangal.netlify.app`).
2. Open that URL on any phone (Android or iOS).
3. Tap **Menu > Install App** (or "Add to Home Screen").
4. It will install exactly like an APK and appear in your app drawer.

### Option B: Generate an APK
If you strictly need an `.apk` file:
1. Follow Step 1 above to get a public URL.
2. Go to a free "Web to APK" converter like **WebAPK** or **AppsGeyser**.
3. Paste your Netlify URL.
4. Download the generated `.apk` file.

## 📍 Location Configuration
The app is currently hardcoded to **Sreemangal, Bangladesh**:
- **Town**: 24.3065° N, 91.7296° E
- **University**: 24.3120° N, 91.7350° E

## 🔧 Troubleshooting
- **"GPS Error"**: Ensure the driver grants location permissions to the browser/app.
- **No Sync**: Ensure both devices have internet access. The app connects to `broker.hivemq.com` on port 8000. Some university firewalls might block this port. If so, try using mobile data.
