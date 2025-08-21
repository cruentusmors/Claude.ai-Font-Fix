@Copilot commented on this pull request.

Pull Request Overview
---------------------

This PR enhances the Claude Font Fix extension with comprehensive accessibility features, specifically adding dyslexic-friendly fonts and improved customization options for users with visual processing differences.

-   Introduces 5 new dyslexic-friendly fonts including OpenDyslexic, Atkinson Hyperlegible, and Lexend
-   Implements web font loading detection with fallback mechanisms and debug tools
-   Updates documentation and store descriptions to emphasize accessibility features

### Reviewed Changes

Copilot reviewed 9 out of 9 changed files in this pull request and generated 5 comments.

Show a summary per file

File

Description

store-description.md

Updates marketing copy to emphasize dyslexic-friendly fonts and accessibility features

readme.md

Adds comprehensive documentation for new accessibility fonts and web font loading

popup.html

Updates extension description to mention dyslexic-friendly fonts

options.js

Adds new font configurations and font loading detection functionality

options.html

Adds accessibility information section and dyslexic-friendly font options

manifest.json

Updates description and adds fonts.css to content scripts

fonts.css

New file containing web font imports and CSS for accessibility fonts

font-test.html

New debugging tool for testing font loading functionality

content.js

Enhances font application with web font loading detection and improved CSS specificity

Tip: Customize your code reviews with copilot-instructions.md. Create the file or learn how to get started.

In content.js:

> +    try {
+      // Check if document.fonts API is available
+      if (document.fonts && document.fonts.ready) {
+        await document.fonts.ready;
+
+        // Check for specific fonts
+        const fontChecks = [
+          new FontFace('Lexend', 'url(https://fonts.gstatic.com/s/lexend/v18/wlptgwvFAVdoq2_v9KXZdw.woff2)').load(),
+          new FontFace('Atkinson Hyperlegible', 'url(https://fonts.gstatic.com/s/atkinsonhyperlegible/v11/9Bt73C1KxNDXMspQ1lPyU89-1h6ONRlW45GE5ZgpewSSbQ.woff2)').load()
+        ];
+
+        await Promise.allSettled(fontChecks);
+
+        // Wait a bit more for fonts to be applied
+        await new Promise(resolve => setTimeout(resolve, 100));
+

Hard-coded external font URLs pose a security risk and may break if Google changes their CDN structure. Consider using the Google Fonts API or implementing proper error handling with fallback URLs.

⬇️ Suggested change

-
+        // Inject Google Fonts API link if not already present
+        const fontLinkId = 'claude-font-fix-google-fonts';
+        if (!document.getElementById(fontLinkId)) {
+          const link = document.createElement('link');
+          link.id = fontLinkId;
+          link.rel = 'stylesheet';
+          link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap';
+          document.head.appendChild(link);
+        }
+        // Wait for fonts to be loaded by the browser
+
+

In fonts.css:

> +
+/* Lexend family - proven to improve reading comprehension */
+@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');
+@import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700&display=swap');
+
+/* Atkinson Hyperlegible - designed for visual accessibility */
+@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
+
+/* Comic Neue - modern alternative to Comic Sans MS */
+@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');
+
+/* OpenDyslexic fonts (fallback to CDN if not locally installed) */
+@font-face {
+  font-family: 'OpenDyslexic';
+  src: url('https://cdn.jsdelivr.net/npm/opendyslexic@2.0.0/fonts/OpenDyslexic-Regular.woff2') format('woff2'),
+       url('https://cdn.jsdelivr.net/npm/opendyslexic@2.0.0/fonts/OpenDyslexic-Regular.woff') format('woff');

Loading fonts from external CDN (jsDelivr) without integrity checks poses a security risk. Consider adding subresource integrity (SRI) hashes or hosting fonts locally to prevent potential supply chain attacks.

⬇️ Suggested change

-       url('https://cdn.jsdelivr.net/npm/opendyslexic@2.0.0/fonts/OpenDyslexic-Regular.woff') format('woff');
+  src: url('./fonts/OpenDyslexic-Regular.woff2') format('woff2'),
+       url('./fonts/OpenDyslexic-Regular.woff') format('woff');

In content.js:

> +
+        await Promise.allSettled(fontChecks);
+
+        // Wait a bit more for fonts to be applied
+        await new Promise(resolve => setTimeout(resolve, 100));
+
+        fontsLoaded = true;
+        debugLog('Claude Font Fix: Web fonts loaded successfully');
+        return true;
+      }
+    } catch (error) {
+      debugLog('Claude Font Fix: Font loading detection failed, proceeding anyway:', error);
+    }
+
+    // Fallback: assume fonts are loaded after a reasonable delay
+    setTimeout(() => { fontsLoaded = true; }, 2000);

The hard-coded 2-second timeout is a magic number that could cause issues on slow networks or fast networks alike. Consider making this configurable or using a more dynamic approach based on actual loading conditions.

⬇️ Suggested change

-    setTimeout(() => { fontsLoaded = true; }, 2000);
+    const timeout = (advancedSettings && typeof advancedSettings.fontLoadTimeout === 'number')
+      ? advancedSettings.fontLoadTimeout
+      : defaultAdvancedSettings.fontLoadTimeout;
+    setTimeout(() => { fontsLoaded = true; }, timeout);

In content.js:

>          font-family: ${fontFamily} !important;
+      }
+
+      /* Special handling for Lexend font */`;
+
+    if (fontFamily.includes('Lexend')) {

String matching for font detection is fragile and could break if font names change. Consider using a more robust font identification method or storing font metadata separately.

⬇️ Suggested change

-    if (fontFamily.includes('Lexend')) {
+    // Robust Lexend font detection
+    const LEXEND_FONT_NAMES = new Set([
+      'Lexend',
+      'Lexend Deca',
+      'Lexend Exa',
+      'Lexend Giga',
+      'Lexend Mega',
+      'Lexend Peta',
+      'Lexend Tera',
+      'Lexend Zetta',
+      'Lexend-Regular'
+    ]);
+    // fontFamily may be a comma-separated list; check each font name
+    const fontNames = fontFamily.split(',').map(f => f.trim().replace(/^["']|["']$/g, ''));
+    const isLexend = fontNames.some(name => LEXEND_FONT_NAMES.has(name));
+    if (isLexend) {

In options.js:

> +      // Set font from element
+      const computedStyle = window.getComputedStyle(element);
+      const fontFamily = computedStyle.fontFamily;
+
+      // Test if the specified font is actually being used
+      context.font = `16px ${fontFamily}`;
+      const testWidth = context.measureText(testText).width;
+
+      context.font = `16px ${fallbackFont}`;
+      const fallbackWidth = context.measureText(testText).width;
+
+      // If widths are significantly different, the font is probably loaded
+      if (Math.abs(testWidth - fallbackWidth) > 1) {
+        return fontFamily.split(',')[0].replace(/['"]/g, '').trim();
+      } else {
+        return 'Fallback font (web font may not be loaded)';

The canvas-based font detection logic uses a magic number (1 pixel difference) that may not be reliable across different browsers, zoom levels, or font rendering engines. Consider using the Font Loading API when available or implementing more robust detection.

⬇️ Suggested change

-        return 'Fallback font (web font may not be loaded)';
+      const computedStyle = window.getComputedStyle(element);
+      const fontFamily = computedStyle.fontFamily;
+      const fontSize = computedStyle.fontSize || "16px";
+      const primaryFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
+
+      // Use the Font Loading API if available
+      if (document.fonts && document.fonts.check) {
+        // Check if the primary font is loaded
+        if (document.fonts.check(`${fontSize} "${primaryFont}"`)) {
+          return primaryFont;
+        } else {
+          // Optionally, try to load the font (async, but we keep this sync for compatibility)
+          return 'Fallback font (web font may not be loaded)';
+        }
+      } else {
+        // Fallback: canvas-based detection (less reliable)
+        const canvas = document.createElement('canvas');
+        const context = canvas.getContext('2d');
+        const testText = 'The quick brown fox jumps over the lazy dog';
+        const fallbackFont = 'monospace';
+        context.font = `${fontSize} ${fontFamily}`;
+        const testWidth = context.measureText(testText).width;
+        context.font = `${fontSize} ${fallbackFont}`;
+        const fallbackWidth = context.measureText(testText).width;
+        // If widths are different, the font is probably loaded (still not robust)
+        if (Math.abs(testWidth - fallbackWidth) > 0.5) {
+          return primaryFont;
+        } else {
+          return 'Fallback font (web font may not be loaded)';
+        }