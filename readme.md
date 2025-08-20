# Claude Font Fix

A Chrome extension that forces Claude.ai to use clean sans-serif fonts instead of serif fonts for better readability.

## 📖 Overview

Claude.ai uses serif fonts by default for AI responses, which can be harder to read for some users. This extension automatically replaces those serif fonts with clean, modern sans-serif fonts across the entire Claude interface with real-time toggle functionality.

## ✨ Features

- **Automatic Font Replacement**: Instantly converts serif fonts to sans-serif
- **System Font Integration**: Uses your system's native fonts for optimal rendering
- **Dynamic Content Support**: Works with new messages as they appear
- **Real-time Toggle Control**: Instant enable/disable through extension popup - no page reload required
- **Smart Font Restoration**: Properly restores original serif fonts when disabled
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
4. **Instant changes** - Changes take effect immediately without requiring a page reload
5. **Perfect restoration** - When disabled, original serif fonts are properly restored

## 🛠️ How It Works

The extension uses multiple sophisticated approaches to ensure complete font coverage and seamless toggling:

- **CSS Variables Override**: Replaces Claude's custom CSS variables
- **Class-based Targeting**: Targets specific font classes like `.font-serif`
- **Dynamic Content Script**: Adds and removes font styles based on user preferences
- **Real-time Toggle**: Changes take effect instantly via storage listeners
- **Smart Style Management**: Stores original font styles for perfect restoration
- **Bidirectional Font Control**: Enforces both sans-serif (enabled) and serif (disabled) fonts
- **MutationObserver**: Monitors for new content and applies fonts automatically
- **Direct Element Styling**: Applies styles directly to elements for immediate effect
- **Prose Element Targeting**: Ensures all text content is affected

### Font Stacks Used

**When Enabled (Sans-serif):**
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif
```

**When Disabled (Serif):**
```css
ui-serif, Georgia, Cambria, "Times New Roman", Times, serif
```

This provides optimal font rendering across different operating systems:
- **macOS**: -apple-system, BlinkMacSystemFont (sans-serif) / ui-serif (serif)
- **Windows**: Segoe UI (sans-serif) / Georgia (serif)
- **Android**: Roboto (sans-serif) / Times New Roman (serif)
- **Linux**: Oxygen, Ubuntu, Cantarell (sans-serif) / Georgia (serif)
- **Fallback**: Generic sans-serif or serif

## 📁 Project Structure

```
claude-font-fix/
├── manifest.json       # Extension configuration
├── content.js          # Main content script with bidirectional font control
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality with real-time storage management
├── icon16.png          # 16x16 icon
├── icon48.png          # 48x48 icon
├── icon128.png         # 128x128 icon
├── icon.svg            # Vector icon source
└── README.md           # This file
```

## 🔧 Technical Details

### Advanced Features
- **Original Style Preservation**: Stores original font-family values for each element
- **Memory Management**: Uses WeakMap-style tracking for efficient memory usage
- **Conflict Prevention**: Proper cleanup of conflicting styles during state changes
- **Performance Optimization**: Debounced mutation observation to prevent excessive processing

### Permissions Required
- `storage`: To save user preferences
- `activeTab`: To access the current Claude.ai tab
- `host_permissions`: Limited to `https://claude.ai/*`

### Browser Compatibility
- Chrome 88+
- Chromium-based browsers (Edge, Brave, Opera)
- Uses Manifest V3 for future compatibility

## 🎨 Customization

To modify the font stacks, edit the CSS in [`content.js`](content.js) within these functions:

**For sans-serif fonts (enabled state):**
```javascript
// In applyFontFix() function
font-family: your-preferred-sans-serif, fallback-sans-serif, sans-serif !important;
```

**For serif fonts (disabled state):**
```javascript
// In addSerifEnforcement() function
font-family: your-preferred-serif, fallback-serif, serif !important;
```

Note: The extension dynamically controls all font styling through the content script for seamless real-time toggle functionality.

## 🐛 Troubleshooting

### Extension not working?
1. Ensure you're on `https://claude.ai`
2. Check that the extension is enabled in `chrome://extensions/`
3. Open browser console (F12) and look for "Claude Font Fix" messages
4. Click the extension icon to verify it's active

### Fonts still appearing as serif when enabled?
1. Open the extension popup and toggle off/on
2. Check browser console for any error messages
3. Try reloading the extension in `chrome://extensions/`
4. Clear browser cache if issues persist

### Fonts not reverting to serif when disabled?
1. Check browser console for "Extension toggled to false" message
2. Look for any JavaScript errors in the console
3. Try refreshing the Claude.ai page
4. Verify storage permissions are granted

### Toggle not working?
1. Check that storage permissions are granted
2. Look for console messages indicating state changes
3. Try disabling and re-enabling the extension
4. Ensure the content script is loaded (check console for initialization messages)

### Performance issues?
1. The extension uses debounced observers - brief delays are normal
2. Check for conflicts with other extensions
3. Monitor browser console for excessive logging

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Report bugs or issues
2. Suggest new features
3. Submit pull requests
4. Improve documentation

### Development Setup

1. Clone the repository
2. Make your changes
3. Test both enabled and disabled states thoroughly
4. Verify real-time toggle functionality
5. Submit a pull request

### Testing Checklist
- [ ] Extension enables/disables instantly
- [ ] Sans-serif fonts apply when enabled
- [ ] Serif fonts restore when disabled
- [ ] Dynamic content gets proper fonts
- [ ] No console errors
- [ ] Performance is acceptable

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Thanks to the Claude.ai team for creating an amazing AI assistant
- Inspired by user feedback requesting better font readability options
- Community contributors who helped improve the toggle functionality

## 📞 Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed information about your browser and OS
- Include console log messages when reporting bugs

---

**Made with ❤️ for better Claude.ai readability**