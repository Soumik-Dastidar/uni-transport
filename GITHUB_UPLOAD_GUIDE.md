# 🚀 How to Make Your App Live & Generate APK

Since I am running in a restricted cloud environment without Android Studio, I cannot generate the `.apk` file directly. However, I have set up your project so you can easily do it yourself using **GitHub** and **PWABuilder**.

## 📋 Requirements to Generate an APK (The "Hard" Way)
If you wanted to build the APK manually on your computer, you would need:
1.  **Node.js & NPM**: To install build tools.
2.  **Android Studio**: A 900MB+ installation.
3.  **Java Development Kit (JDK)**: For signing the app.
4.  **Android SDK Command Line Tools**: To compile the code.

**💡 The Easy Way (Recommended)**: Use the cloud tools I've prepared for you below.

---

##  step 1: Upload to GitHub (Make it Live)
Since you don't have `git` installed, you can upload via the browser:

1.  **Create a Repository**: Go to [GitHub.com/new](https://github.com/new) and name it `uni-transport`.
2.  **Upload Files**:
    *   Click "uploading an existing file".
    *   Drag and drop ALL files from your `uni-transport-app` folder (index.html, app.js, manifest.json, sw.js, etc.).
    *   **Important**: Make sure you also drag the `.github` folder! (You might need to create the folder structure manually on GitHub if drag-and-drop doesn't work for hidden folders: Click "Add file" > "Create new file" > type `.github/workflows/deploy.yml` and paste the content I created).
3.  **Commit**: Click "Commit changes".

## Step 2: Activate Live Site
1.  Go to your repository **Settings** > **Pages**.
2.  Under "Source", select **GitHub Actions**.
3.  The workflow I created (`deploy.yml`) will automatically run.
4.  In 1-2 minutes, you will get a live URL (e.g., `https://your-username.github.io/uni-transport`).

## Step 3: Generate the APK (Cloud Build)
Now that your site is live, turn it into an APK:

1.  Go to **[PWABuilder.com](https://www.pwabuilder.com/)**.
2.  Paste your live GitHub Pages URL (from Step 2).
3.  Click **Start**.
4.  Click **Package for Store**.
5.  Select **Android**.
6.  Download the **APK** file.

## Step 4: Share with Students
1.  Go back to your GitHub Repository.
2.  Click **Releases** (on the right) > **Draft a new release**.
3.  Tag it `v1.0`.
4.  Upload the `.apk` file you downloaded from PWABuilder.
5.  Click **Publish release**.

Now, anyone can go to your GitHub Releases page and download the app!
