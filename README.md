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
  - Sentiment Analysis [Coming Soon at this point!]

## Supported File Types
- Text files (txt, markdown, etc.)
- Image files (png, jpg, jpeg, etc.) [Coming Soon at this point!]
- PDF files [Coming Soon at this point!]

## Setup
To use this extension, you will need API keys for each of the AI platforms you plan to use.

### Google Gemini
1.  Go to the [Google AI Studio](https://makersuite.google.com/app/apikey) to obtain an API key.
2.  Enter your API key in the extension's settings page.

### Cloudflare AI Workers
1.  Set up a Cloudflare Workers AI account.
2.  Obtain your Account ID and API Token.
3.  Enter the Account ID and API Token in the extension's settings page.

### OpenRouter AI
1.  Go to [OpenRouter](https://openrouter.ai/) to create an account and obtain an API key.
2.  Enter your API key in the extension's settings page.

## Usage

1.  Install the extension from the Chrome Web Store (when available) or load the unpacked extension.
2.  Open the extension's popup to configure your desired AI platform and model.
3.  Right-click on any selected text on a webpage to access the context menu options.
4.  Choose an AI operation from the context menu to process the selected text.
5.  For image or PDF analysis, right-click on a link to the file and select "Analyze with AI". [Coming Soon at this point!]

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