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
                console.log('Content copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
}

function showPromptInput(fileUrl, fileType) {
    const popup = document.createElement('div');
    popup.id = 'ai-assistant-prompt-input';
    popup.innerHTML = `
        <textarea id="customPrompt" placeholder="Enter your prompt here"></textarea>
        <div class="button-container">
            <button id="sendImageButton" class="solarized-button">Send Image</button>
            <button id="closeButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(popup);

    const sendImageButton = document.getElementById('sendImageButton');
    sendImageButton.addEventListener('click', async () => {
        const customPrompt = document.getElementById('customPrompt').value;
        const settings = await getSettings();
        let apiKey = settings.geminiApiKey;
        if (settings.platform === 'OpenRouter') {
            apiKey = settings.openrouterApiKey;
        } else if (settings.platform === 'Cloudflare Worker AI') {
            apiKey = settings.cloudflareApiKey;
        }
        
        chrome.runtime.sendMessage({
            action: 'processImage',
            data: {
                base64Content: fileUrl,
                mimeType: fileType,
                prompt: customPrompt,
                apiKey: apiKey
            }
        }, response => {
            if (response && response.data) {
                showPopup(response.data);
            } else if (response && response.error) {
                console.error('Error processing image:', response.error);
                showPopup(`Error: ${response.error.message}`);
            } else {
                console.error('Unknown error occurred');
                showPopup('Unknown error occurred');
            }
            popup.remove();
        });
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
}

async function getImageData(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return await readFileAsDataURL(blob);
    } catch (error) {
        throw new Error(`Failed to fetch image: ${error.message}`);
    }
}

async function readFileAsDataURL(blob) {
    try {
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