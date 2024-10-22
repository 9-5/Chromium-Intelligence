# Chromium Intelligence

A powerful Chromium extension that leverages the Gemini API to assist with various text operations including proofreading, rewriting, summarization, and more.

## Features

- **Context Menu Integration**: Right-click on any selected text to access AI assistance
- **Multiple Writing Operations**:
  - Proofreading
  - Text Rewriting
  - Friendly Tone Conversion
  - Professional Tone Conversion
  - Concise Rewrites
  - Text Summarization
  - Key Points Extraction
  - Table Conversion
  - Custom Text Operations

## Requirements

- Google Chrome Browser
- Gemini API Key (obtain from [Google AI Studio](https://ai.google.dev))
- Active internet connection

## Setup

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. Click the extension icon in your Chrome toolbar
6. Enter your Gemini API key in the settings popup
7. Test your API key using the "Test API Key" button

## Usage

1. Select any text on a webpage
2. Right-click to open the context menu
3. Choose one of the following operations:
   - Proofread
   - Rewrite
   - Friendly
   - Professional
   - Concise
   - Summary
   - Key Points
   - Table
   - Custom

The processed text will appear in a popup window with options to copy to clipboard or close.

## Files Structure
```
├── manifest.json # Extension configuration
├── background.js # Background service worker
├── contents.js # Content script for webpage interaction
├── popup.html # API key settings interface
├── popup.js # Settings functionality
├── display.html # Response popup template
└── display.js # Popup functionality
```

## Technical Details

- Built using Manifest V3
- Uses the Gemini 1.5 Flash API
- Implements secure API key storage
- Features responsive popup UI
- Maintains original text language in responses

## Privacy Notice

This extension:
- Only processes text you explicitly select
- Stores your API key locally in Chrome storage
- Sends selected text to Gemini API for processing
- Does not collect or store any user data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built using Google's Gemini API
- Inspired by Apple Intelligence

## Support



---

_Note: This extension requires a valid Gemini API key to function. Get yours at [Google AI Studio](https://ai.google.dev)_
