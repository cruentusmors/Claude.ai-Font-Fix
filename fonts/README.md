# Fonts Directory - Local Font Hosting

This directory contains locally hosted OpenDyslexic font files to reduce external dependencies and improve security.

## Current Status: LOCAL FONTS ACTIVE

✅ **Font Files Present**: Actual OpenDyslexic font files are now properly installed  
✅ **404 Errors Fixed**: Local font loading working correctly  
📁 **Binary Files**: All font files are proper binary formats (WOFF/WOFF2)

## Font Files Currently Installed

The following OpenDyslexic font files are available:

```
fonts/
├── README.md                          # This documentation
├── OpenDyslexic-Bold-Italic.woff      # Bold Italic style, WOFF format
├── OpenDyslexic-Bold-Italic.woff2     # Bold Italic style, WOFF2 format  
├── OpenDyslexic-Bold.woff             # Bold weight, WOFF format
├── OpenDyslexic-Bold.woff2            # Bold weight, WOFF2 format
├── OpenDyslexic-Italic.woff           # Italic style, WOFF format
├── OpenDyslexic-Italic.woff2          # Italic style, WOFF2 format
├── OpenDyslexic-Regular.woff          # Regular weight, WOFF format
└── OpenDyslexic-Regular.woff2         # Regular weight, WOFF2 format
```

## Manual Installation Process (If Needed)

If you need to reinstall or update the font files, follow these detailed steps:

### Step 1: Download the Font Archive

```powershell
# Create a temporary workspace
New-Item -ItemType Directory -Path "temp_fonts" -Force
Set-Location "temp_fonts"

# Download the OpenDyslexic repository archive
Invoke-WebRequest -Uri "https://github.com/antijingoist/opendyslexic/archive/refs/heads/master.zip" -OutFile "opendyslexic-master.zip"

# Extract the archive
Expand-Archive -Path "opendyslexic-master.zip" -DestinationPath "extracted" -Force
```

### Step 2: Locate the Font Files

After extraction, examine the directory structure to locate the compiled fonts:

```powershell
# Navigate and explore the extracted structure
Set-Location "extracted"
Get-ChildItem -Recurse -Filter "*.woff*" | Format-Table Name, Directory, Length

# The fonts are typically in one of these locations:
# - opendyslexic-master/woff/
# - opendyslexic-master/compiled/
# - opendyslexic-master/fonts/
```

### Step 3: Copy Font Files to Extension

```powershell
# Example paths - adjust based on actual structure found in Step 2
$sourcePath = "opendyslexic-master/woff"  # or wherever the fonts are located
$destinationPath = "../fonts"  # Back to the extension's fonts directory

# Copy all WOFF and WOFF2 files
Copy-Item "$sourcePath/*.woff" -Destination $destinationPath -Force
Copy-Item "$sourcePath/*.woff2" -Destination $destinationPath -Force

# Verify the files were copied
Get-ChildItem $destinationPath -Filter "*.woff*" | Format-Table Name, Length
```

### Step 4: Cleanup and Verification

```powershell
# Return to parent directory and cleanup
Set-Location ".."
Remove-Item "temp_fonts" -Recurse -Force

# Verify final installation in extension fonts directory
Get-ChildItem "fonts" -Filter "*.woff*" | Format-Table Name, Length

# Check file sizes - they should be substantial (>20KB each)
Get-ChildItem "fonts" -Filter "*.woff*" | Where-Object { $_.Length -lt 10KB } | Format-Table Name, Length
```

## Alternative: Manual Download Method

If the PowerShell method doesn't work, manually download the fonts:

1. **Visit the OpenDyslexic Repository**:
   - Go to: https://github.com/antijingoist/opendyslexic
   - Navigate to the `woff/` or `compiled/` directory
   - Look for the font files with `.woff` and `.woff2` extensions

2. **Download Each File Individually**:
   - Right-click each font file → "Save link as..."
   - Save directly to the `fonts/` directory in your extension
   - Ensure filenames match exactly: `OpenDyslexic-Regular.woff2`, etc.

3. **Verify Downloads**:
   - Each file should be >20KB in size
   - Files should have binary content (not HTML error pages)
   - Test loading one in your browser to verify it's a valid font

## Font Loading Priority System

The extension uses a multi-tier loading approach in [`fonts.css`](../fonts.css):

```css
@font-face {
  font-family: 'OpenDyslexic';
  src: local('OpenDyslexic'),                                    /* 1. System-installed font */
       url('fonts/OpenDyslexic-Regular.woff2') format('woff2'), /* 2. Local extension file */
       url('fonts/OpenDyslexic-Regular.woff') format('woff'),   /* 3. Local fallback */
       url('https://opendyslexic.org/files/fonts/OpenDyslexic-Regular.woff2'); /* 4. CDN fallback */
}
```

## Troubleshooting

### File Size Check
Ensure font files are substantial binary files:
```powershell
Get-ChildItem "fonts" -Filter "*.woff*" | Where-Object { $_.Length -gt 20KB }
```

### Network Tab Verification
1. Open Chrome DevTools → Network tab
2. Load extension and visit claude.ai
3. Look for font requests:
   - ✅ `extension://[id]/fonts/OpenDyslexic-Regular.woff2` - Local loading
   - ⚠️ `https://opendyslexic.org/...` - CDN fallback (acceptable)
   - ❌ 404 errors - Font files missing or corrupted

### Console Error Check
Look for font loading errors in browser console:
```javascript
// Should see successful font loading logs from content.js
// No 404 or font parsing errors
```

## Security & Performance Benefits

✅ **Offline Functionality**: Fonts work without internet connection  
✅ **Privacy Protection**: No external requests when local fonts available  
✅ **Performance**: Faster loading from local extension storage  
✅ **Reliability**: No dependency on external CDN availability  
✅ **Security**: Reduced attack surface from external dependencies  

## Integration Status

✅ **[manifest.json](../manifest.json)**: Configured with `web_accessible_resources`  
✅ **[fonts.css](../fonts.css)**: Multi-tier loading with local priority  
✅ **Font Files**: All 8 variants properly installed and verified  
✅ **[content.js](../content.js)**: Integrated OpenDyslexic support  
✅ **Testing**: Local font loading confirmed working  

## License Compliance

OpenDyslexic fonts are licensed under the **SIL Open Font License (OFL)**:
- ✅ Commercial use permitted
- ✅ Distribution permitted  
- ✅ Modification permitted
- ✅ Attribution maintained in font metadata

License details: https://openfontlicense.org/