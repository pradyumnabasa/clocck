# CLocck 🕰️

A minimalist, highly optimized Windows Flip Clock screensaver and desktop application with real-time news integration and rotating productivity quotes. Built with Electron, HTML5, and CSS3.

<img width="1178" height="754" alt="image" src="https://github.com/user-attachments/assets/2980d8cb-e502-4df7-88ed-14496cd9acf1" />


## Features ✨
- **OLED Dark Mode Design**: Clean, distraction-free matte black interface (`#000000`).
- **Hardware-Accelerated 3D Flip Clock**: Smooth and realistic CSS 3D transforms (`rotateX`) optimized to run flawlessly with zero DOM allocations per second, ensuring zero lag on startup or runtime.
- **Productivity Quotes**: Rotating curated productivity quotes to keep you focused.
- **Live India News Ticker**: Stay updated passively with real-time headlines spanning Indian business, tech, and space exploration.
- **Instant Boot**: Optimized Electron `ready-to-show` sequence completely eliminates the traditional black screen lag. 

## Installation (Screensaver Mode) 💻

If you just want to use CLocck as a screensaver:
1. Head to the **Releases** tab and download the latest `clocck.scr` file (or build it yourself from source).
2. Right-click the downloaded `clocck.scr` file.
3. Select **Test** to preview the screensaver instantly.
4. Select **Install** to add it to your native Windows Screen Saver settings.

*To exit the screensaver, simply move your mouse significantly or press any key on your keyboard.*

## Building from Source 🛠️

To modify the app or compile it yourself, you will need [Node.js](https://nodejs.org/) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pradyumnabasa/clocck.git
   cd clocck
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run locally in development mode:**
   ```bash
   npm start
   ```
4. **Build the portable executable:**
   ```bash
   npm run build
   ```
   *The executable will be generated inside the `dist/` folder. You can rename the resulting `.exe` file to `.scr` to use it as a Windows screensaver.*

## Architecture 🏗️
- **Electron**: Handles the native Windows bindings, CLI arguments (`/s`), and full-screen overlay mechanics.
- **Vanilla JS/CSS**: Kept completely framework-free to maximize performance and minimize bundle size.

## License 📜
This project is open-source and available under the [ISC License](LICENSE).
