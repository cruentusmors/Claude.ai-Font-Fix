# Claude Font Fix

A Chrome extension that forces Claude.ai to use clean sans-serif fonts instead of serif fonts for better readability.

## 📖 Overview

Claude.ai uses serif fonts by default for AI responses, which can be harder to read for some users. This extension automatically replaces those serif fonts with clean, modern sans-serif fonts across the entire Claude interface.

## ✨ Features

- **Automatic Font Replacement**: Instantly converts serif fonts to sans-serif
- **System Font Integration**: Uses your system's native fonts for optimal rendering
- **Dynamic Content Support**: Works with new messages as they appear
- **Toggle Control**: Easy enable/disable through extension popup with automatic page reload
- **Lightweight**: Minimal performance impact
- **Persistent Settings**: Remembers your preferences across sessions
- **Debug Support**: Console logging for troubleshooting

## 🚀 Installation

### From Chrome Web Store
*Coming soon...*

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## 🎯 Usage

1. **Navigate to Claude.ai** - The extension automatically activates on Claude.ai
2. **View improved fonts** - Serif fonts are automatically replaced with sans-serif
3. **Toggle if needed** - Click the extension icon to enable/disable the font fix
4. **Page reload on toggle** - The page automatically reloads when you toggle the extension to apply changes

## 🛠️ How It Works

The extension uses multiple approaches to ensure complete font coverage:

- **CSS Variables Override**: Replaces Claude's custom CSS variables
- **Class-based Targeting**: Targets specific font classes like `.font-serif`
- **Dynamic Content Script**: Adds and removes font styles based on user preferences
- **Automatic Page Reload**: Reloads the page when toggling to ensure clean state
- **MutationObserver**: Monitors for new content and applies fonts automatically
- **Direct Element Styling**: Applies styles directly to elements for immediate effect
- **Prose Element Targeting**: Ensures all text content is affected

### Font Stack Used
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif
```

This provides optimal font rendering across different operating systems:
- **macOS**: -apple-system, BlinkMacSystemFont
- **Windows**: Segoe UI
- **Android**: Roboto
- **Linux**: Oxygen, Ubuntu, Cantarell
- **Fallback**: Generic sans-serif

## 📁 Project Structure

```
claude-font-fix/
├── manifest.json       # Extension configuration
├── content.js          # Main content script with dynamic toggle support
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality with storage management
├── icon16.png          # 16x16 icon
├── icon48.png          # 48x48 icon
├── icon128.png         # 128x128 icon
├── icon.svg            # Vector icon source
└── README.md           # This file
```

## 🔧 Technical Details

### Permissions Required
- `storage`: To save user preferences
- `activeTab`: To access the current Claude.ai tab
- `host_permissions`: Limited to `https://claude.ai/*`

### Browser Compatibility
- Chrome 88+
- Chromium-based browsers (Edge, Brave, Opera)
- Uses Manifest V3 for future compatibility

## 🎨 Customization

To modify the font stack, edit the CSS in `content.js` within the `applyFontFix()` function:

```css
font-family: your-preferred-font, fallback-font, sans-serif !important;
```

Note: The extension now dynamically controls all font styling through the content script for better toggle functionality.

## 🐛 Troubleshooting

### Extension not working?
1. Ensure you're on `https://claude.ai`
2. Check that the extension is enabled in `chrome://extensions/`
3. Open browser console (F12) and look for "Claude Font Fix" messages
4. Click the extension icon to verify it's active

### Fonts still appearing as serif?
1. Open the extension popup and toggle off/on
2. Check browser console for any error messages
3. Try reloading the extension in `chrome://extensions/`
4. Clear browser cache if issues persist

### Toggle not working?
1. Check that storage permissions are granted
2. Look for console messages indicating state changes
3. Try disabling and re-enabling the extension

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Report bugs or issues
2. Suggest new features
3. Submit pull requests
4. Improve documentation

### Development Setup

1. Clone the repository
2. Make your changes
3. Test in Chrome developer mode
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Thanks to the Claude.ai team for creating an amazing AI assistant
- Inspired by user feedback requesting better font readability options

## 📞 Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed information about your browser and OS

---

**Made with ❤️ for better Claude.ai readability**