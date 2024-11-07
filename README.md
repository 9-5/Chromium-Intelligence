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
  - Translation [Coming Soon!]
  - Sentiment Analysis [Coming Soon!]

- **Image Analysis**:
  - Object Detection [Coming Soon!]
  - Image Captioning
  - Visual Question Answering [Coming Soon!]

- **PDF Processing**:
  - Summarization
  - Text Extraction [Coming Soon!]

## Installation

1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory where you cloned the repository.
5. Go to extension options page to provide the api key and other settings!

## Usage

1. **Text Operations**: Simply select any text on a webpage, right-click, and choose from the context menu to perform operations like proofreading, rewriting, or summarizing.
2. **Image Analysis**: Right-click on any image, select "Analyze Image," and choose an analysis option like "Caption Image."  [Still Experimental at this point!]
3. **PDF Processing**: Right-click on a PDF link, select "Process PDF," and choose an operation like "Summarize PDF." [Still Experimental at this point!]

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