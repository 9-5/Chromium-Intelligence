chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPopup') {
        showPopup(request.data);
    } else if (request.action === 'showPromptInput') {
        showPromptInput(request.fileUrl, request.fileType);
    }
    return true;
});

function showPopup(content) {
    const popup = document.createElement('div');
    popup.id = 'ai-assistant-popup';
    popup.innerHTML = `
        <textarea id="responseText" readonly>${content}</textarea>
        <div class="button-container">
            <button id="copyButton" class="solarized-button">Copy to Clipboard</button>
            <button id="closeButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(popup);

    const copyButton = document.getElementById('copyButton');
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(content)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
}

function showPromptInput(fileUrl, fileType) {
    const promptInputArea = document.createElement('div');
    promptInputArea.id = 'ai-assistant-prompt-input';
    promptInputArea.innerHTML = `
        <textarea id="imagePrompt" placeholder="Enter your prompt for the image/PDF"></textarea>
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process</button>
            <button id="closeButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(promptInputArea);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', () => {
        const prompt = document.getElementById('imagePrompt').value;
        processFile(fileUrl, fileType, prompt);
        promptInputArea.remove();
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        promptInputArea.remove();
    });
}

async function processFile(fileUrl, fileType, prompt) {
    try {
        const { base64Content, mimeType } = await getBase64Content(fileUrl, fileType);

        getSettings().then(settings => {
            const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = settings;
            let apiKey;

            if (platform === 'Gemini') {
                apiKey = geminiApiKey;
            } else if (platform === 'Cloudflare Worker AI') {
                apiKey = cloudflareApiKey;
            } else if (platform === 'OpenRouter') {
                apiKey = openrouterApiKey;
            }

            chrome.runtime.sendMessage({
                action: 'processImage',
                data: { base64Content, mimeType, prompt, apiKey }
            }, response => {
                if (response && response.data) {
                    showPopup(response.data);
                } else if (response && response.error) {
                    alert(`Error: ${response.error.message}`);
                } else {
                    alert('Unknown error occurred.');
                }
            });
        });
    } catch (error) {
        alert(`Error processing file: ${error.message}`);
    }
}

async function getBase64Content(fileUrl, fileType) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${fileType}: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Content = reader.result.split(',')[1];
                resolve({ base64Content, mimeType: blob.type });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        throw new Error(`Failed to fetch image: ${error.message}`);
    }
}

function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([
            'platform',
            'model',
            'use_specific_model',
            'custom_model',
            'geminiApiKey',
            'openrouterApiKey',
            'cloudflareId',
            'cloudflareApiKey'
        ], resolve);
    });
}