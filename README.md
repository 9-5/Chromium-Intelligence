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
  - Sentiment Analysis [Coming Soon!]
  - Translate to [Coming Soon!]

## Installation

1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1.  Install the extension from the Chrome Web Store [Coming Soon!]
2.  Open the extension popup to configure your desired AI platform and API key
3.  Right-click on any text, image, or PDF link to access the available AI operations.
4.  For image analysis, right-click the image and select "Analyze Image with AI".

**Note**: API keys are required to use the AI platforms. Get your API keys from the respective platform websites and paste it in the options page.

## Configuration

Configure the extension via the options page:
- Choose your prefered platform (Gemini, Cloudflare AI, OpenRouter)
- Enter API keys
- Choose a default model

## Supported Text Operations at this point!

- Proofreading [Useful to correct any grammar or spelling mistakes]
- Rewriting [Useful to re-phrase any text]
- Friendly Tone Conversion [Useful to convert any text into a friendly tone]
- Professional Tone Conversion [Useful to convert any text into a professional tone]
- Concise Rewrites [Useful to shorten any text]
- Text Summarization [Useful to get the gist of any text]

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