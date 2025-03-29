# Downloading LeetTrack

To download this project from Replit to your local system, follow these steps:

## Method 1: Download as ZIP

1. Click on the three dots (...) in the Files pane
2. Select "Download as zip"
3. Extract the ZIP file to your preferred location
4. In the extracted folder, update package.json with:
   ```json
   {
     "name": "leettrack",
     "version": "1.0.0",
     "description": "LeetCode profile analysis and comparison tool for tracking programming progress",
     "type": "module",
     "license": "MIT",
     ...
   }
   ```

## Method 2: Clone with Git

1. Initialize a new git repository in the project folder (if not already done)
   ```bash
   git init
   ```

2. Add all files to git
   ```bash
   git add .
   ```

3. Make an initial commit
   ```bash
   git commit -m "Initial commit"
   ```

4. On GitHub, create a new repository

5. Connect your local repository to GitHub
   ```bash
   git remote add origin https://github.com/yourusername/leettrack.git
   ```

6. Push the code to GitHub
   ```bash
   git push -u origin main
   ```

## After Downloading

1. Run `npm install` to install dependencies
2. Update package.json with your project details
3. Run the application with `npm run dev`
4. Access the application in your browser at `http://localhost:5000`

## Making Changes for GitHub

When moving to GitHub, consider making these changes:

1. Update package.json with appropriate name, description, and author
2. Replace placeholder text in the LICENSE file with your name
3. Update the README.md with your GitHub username and contact information
4. Add additional screenshots or documentation as needed