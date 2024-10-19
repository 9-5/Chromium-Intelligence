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
  - Sentiment Analysis [coming soon at this point!]

## PDF Processing
- Process and understand PDF content through user prompts. [coming soon at this point!]

## Image Understanding
- Extract valuable insights from images using AI vision models. [coming soon at this point!]

## Installation

1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

1.  Install the extension
2.  Right click on some text, image, or PDF link
3.  Choose an option from the context menu to perform an AI operation on the content. [More platforms and operations coming at this point!]

## API Key Setup

You will need to provide your own API keys for the AI platforms you want to use. You can enter these keys in the extension's settings page.

- **Gemini API**: Get your API key [here](https://ai.google.dev/tutorials/setup)
- **Cloudflare Workers AI**: Refer to the [documentation](https://developers.cloudflare.com/workers-ai/) for setup instructions.
- **OpenRouter AI**: Get your API key [here](https://openrouter.ai/keys)

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