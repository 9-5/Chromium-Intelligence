# Chromium Intelligence

A powerful Chromium extension that leverages the Gemini API to assist with various text operations, image analysis, and PDF processing.

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
 ├── manifest.json # Extension configuration
 ├── background.js # Background service worker
 ├── contents.js # Content script for webpage interaction
 ├── popup.html # API key settings interface
 ├── popup.js # Settings functionality
 └── README.md # This file
```

## Technical Details

- Built using Manifest V3
- Uses the Gemini 1.5 Flash API
- Implements secure API key storage
- Features responsive popup UI
- Maintains original text language in responses
- Supports image and PDF processing with custom prompts

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

- Built using Google's Gemini API
- Inspired by Apple Intelligence

---

_Note: This extension requires a valid Gemini API key to function. Get yours at [Google AI Studio](https://ai.google.dev)_
