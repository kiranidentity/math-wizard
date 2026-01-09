---
description: How to push to GitHub and deploy to GitHub Pages
---

### 1. Initialize Git and Commit
// turbo
1. Initialize the repository: `git init`
2. Add all files: `git add .`
3. Create the first commit: `git commit -m "feat: initial math wizard worksheet generator"`

### 2. Connect to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Copy the remote URL (e.g., `https://github.com/yourusername/math-wizard.git`).
3. Add the remote: `git remote add origin YOUR_URL_HERE`
4. Rename branch: `git branch -M main`
5. Push to GitHub: `git push -u origin main`

### 3. Deploy to GitHub Pages
1. On your GitHub repository page, go to **Settings**.
2. Click on **Pages** in the left sidebar.
3. Under **Build and deployment > Branch**, select `main` (or the branch you pushed to) and the `/ (root)` folder.
4. Click **Save**.
5. Wait a minute, and your app will be live at `https://yourusername.github.io/repo-name/`.
