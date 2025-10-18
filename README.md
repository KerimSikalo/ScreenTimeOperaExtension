# Screen Time Tracker for Opera

A lightweight browser extension that tracks your active browsing time across different websites. Get insights into your web habits with automatic idle detection and local data storage.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome Extension](https://img.shields.io/badge/Opera-Extension-red)

## Features

- **Real-time Tracking** – Monitors active time on each website with per-second precision
- **Smart Idle Detection** – Automatically pauses tracking when you're inactive (customizable threshold)
- **100% Local Storage** – All data stays on your device using browser storage APIs—no servers, no external tracking
- **Daily Statistics** – View total browsing time and breakdown by website
- **Customizable Settings** – Adjust idle detection sensitivity to fit your workflow
- **Minimal Footprint** – Lightweight background service worker that runs efficiently in the background

## How It Works

1. **Activity Monitoring** – The extension detects mouse movement, keyboard input, page focus, and scrolling
2. **Time Tracking** – When active, it records 1 second per ping from each website's content script
3. **Idle Detection** – If no activity is detected for the threshold duration (default: 60 seconds), tracking pauses
4. **Data Storage** – All statistics are stored locally in your browser storage, organized by date
5. **Auto-cleanup** – Old data beyond 60 days is automatically pruned to save storage space

## Installation (Developer Mode)

### For Opera Browser

1. Clone or download this repository:
   ```bash
   git clone https://github.com/KerimSikalo/ScreenTimeOperaExtension.git
   ```

2. Open Opera and navigate to extensions:
   - Type `opera://extensions` in the address bar or go to Menu → Extensions → Manage Extensions

3. Enable **Developer Mode** (toggle in the top right corner)

4. Click **Load unpacked** and select the project folder

5. The extension will appear in your Opera toolbar—click it to view your screen time

### For Chrome-based Browsers

The same process works for Chromium-based browsers:
- Chrome: `chrome://extensions`
- Edge: `edge://extensions`
- Brave: `brave://extensions`

## Usage

### Popup View

Click the extension icon to see:
- **Total active time today** displayed prominently
- **List of websites** ranked by time spent (top 20)
- **Reset button** to clear today's data
- **Settings link** to customize behavior

### Settings

Access extension options to configure:
- **Idle Threshold** – How long (in seconds) before the extension considers you inactive
  - Minimum: 5 seconds
  - Default: 60 seconds
  - Adjust based on your browsing habits

## Project Structure

```
ScreenTimeOperaExtension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (tracks and aggregates data)
├── content_script.js      # Page-level script (monitors activity)
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and data display
├── options.html          # Settings page
├── options.js            # Settings logic
├── icons/                # Extension icons (16px, 48px, 128px)
├── LICENSE               # MIT License
├── PRIVACY_POLICY.md     # Privacy information
└── README.md             # This file
```

## Architecture

### Background Service Worker (background.js)

- Receives "ping" messages from active content scripts
- Aggregates time per hostname and per day
- Manages local storage with the schema: `{ daily: { "YYYY-MM-DD": { total: seconds, bySite: { hostname: seconds } } } }`
- Auto-prunes data older than 60 days

### Content Script (content_script.js)

- Injected into every page
- Monitors user activity (mouse, keyboard, focus, scroll)
- Sends 1-second pings to the background service when active
- Gracefully handles extension context invalidation

### Popup (popup.html & popup.js)

- Displays today's statistics
- Shows top 20 websites by time
- Provides quick access to reset and settings

## Privacy & Security

Your data is yours alone:
- Zero external servers or API calls
- No analytics or tracking by third parties
- Data stored exclusively in Chrome/Opera local storage
- Full source code transparency

See PRIVACY_POLICY.md for details.

## Permissions

The extension requests these permissions:

- `storage` – To save and retrieve browsing statistics
- `tabs` – To access tab information
- `alarms` – To schedule periodic data cleanup
- `scripting` – To inject content scripts into pages
- `activeTab` – To work with the currently active tab
- `<all_urls>` – To track time on any website

All permissions are used only for local tracking and data management.

## Performance

- **Lightweight** – Uses a service worker instead of a persistent background page
- **Efficient pinging** – One message per second per active tab
- **Smart idle detection** – Stops pinging automatically during inactivity
- **Automatic cleanup** – Removes old data to prevent storage bloat
- **Error handling** – Gracefully handles extension reloads and edge cases

## Roadmap & Future Features

Potential enhancements for future versions:
- Weekly/monthly statistics and charts
- Dark mode UI
- Customizable time goals and alerts
- Data export (CSV/JSON)
- Notifications for excessive usage
- Sync across devices (with privacy controls)

## Troubleshooting

### Extension stops tracking

- Ensure the extension is enabled in `opera://extensions`
- Check if the tab has focus (extension pauses when tab is in background)
- Verify idle threshold isn't too low in Settings

### Data not showing

- Refresh the popup (close and reopen)
- Check browser console for errors (F12 → Console)
- Verify local storage isn't disabled in browser settings

### High memory usage

- This is rare with a service worker, but check for background tab issues
- Try resetting today's data from the popup

## Contributing

Found a bug or have a feature request? Please open an issue:
https://github.com/KerimSikalo/ScreenTimeOperaExtension/issues

## License

This project is licensed under the MIT License—see LICENSE for details.

## Author

Created by Kerim Šikalo

---

Disclaimer: This extension tracks time spent on websites for personal awareness only. Use responsibly and be aware of your digital habits. The creator is not responsible for how this data is used by the end user.
