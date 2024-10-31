<p align="center"><img src="ext\logo.png" height="250" width="250"/></p>

# Chromium Intelligence

A powerful Chromium extension that leverages the multiple AI APIs to assist with various text operations, image analysis, and PDF processing.

## Supported Platforms

- [Google Gemini](https://ai.google.dev/gemini-api/docs/models/gemini)
- [Cloudflare AI Workers](https://developers.cloudflare.com/workers-ai/models/)
- [OpenRouter AI](https://openrouter.ai/)

## Features

- **Context Menu Integration**: Right-click on selected text, images, or PDF links to access AI assistance
- **Multiple Text Operations**:
  - Proofreading
  - Text Rewriting
  - Friendly Tone Conversion
  - Professional Tone Conversion
  - Concise Rewrites
  - Text Summarization
  - Key Points Extraction
  - Step-by-Step Guide Conversion
- **Image and PDF Processing**:
  - Analyze images with custom prompts
  - Process PDF files with custom prompts
- **Custom Prompting**: Ability to input custom prompts for image and PDF analysis

## Requirements

- Chromium Based Browser [Chrome, Edge, Opera GX, Brave, etc.]
- Gemini API Key (obtain from [Google AI Studio](https://ai.google.dev))
- Cloudflare API Key (obtain from [Cloudflare AI](https://developers.cloudflare.com/workers-ai/models/))
- OpenRouter API Key (obtain from [OpenRouter AI](https://openrouter.ai/))
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

### Text Operations
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
   - Stepify

### Image Analysis
1. Right-click on any image
2. Select "Process Image" from the context menu
3. Enter a custom prompt in the popup dialog
4. Click "Submit" to analyze the image

### PDF Processing
1. Right-click on a PDF link
2. Select "Process PDF" from the context menu
3. Enter a custom prompt in the popup dialog
4. Click "Submit" to process the PDF

The processed text or analysis results will appear in a popup window with options to copy to clipboard or close.

## Files Structure
```
\
├── ext                     # Extension folder
│   ├── logo.png            # Extension logo
│   ├── icon                # Icon folder
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── settings            # Settings folder
│   │    ├── settings.html  # Extension settings
│   │    ├── settings.css   # Extension settings UI
│   │    └── settings.js    # Extension settings UI styles
│   └── popup               # Popup folder
│        ├── popup.html     # Popup UI
│        ├── popup.css      # Popup UI styles
│        └── popup.js       # Popup UI script
├── manifest.json           # Extension configuration
├── background.js           # Background service worker
├── contents.js             # Content script for webpage interaction
└── README.md               # This file
```

## Technical Details

- Built using Manifest V3
- Can use the Gemini, Cloudflare Worker AI, and OpenRouter APIs
- Implements secure API key storage
- Features responsive popup UI
- Maintains original text language in responses
- Supports image and PDF processing with custom prompts [Gemini only at this point!]

## Privacy Notice

This extension:
- Only processes text, images, or PDFs you explicitly select
- Stores your API key locally in Chrome storage
- Sends selected content to Gemini API for processing
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

- Built using Google's Gemini, Cloudflare Workers AI, and OpenRouter APIs
- Inspired by Apple Intelligence
