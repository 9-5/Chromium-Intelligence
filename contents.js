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
        const responseText = document.getElementById('responseText');
        navigator.clipboard.writeText(responseText.value)
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
    promptInputArea.id = 'ai-prompt-input-area';
    promptInputArea.innerHTML = `
        <textarea id="imagePrompt" placeholder="Enter your prompt here"></textarea>
        <div class="button-container">
            <button id="processImageButton" class="solarized-button">Process Image</button>
            <button id="closePromptButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(promptInputArea);

    const processImageButton = document.getElementById('processImageButton');
    processImageButton.addEventListener('click', async () => {
        const prompt = document.getElementById('imagePrompt').value;
        try {
            const { base64Content, mimeType } = await getImageData(fileUrl);
            const settings = await getSettings();

            chrome.runtime.sendMessage({
                action: 'processImage',
                data: {
                    base64Content: base64Content,
                    mimeType: mimeType,
                    prompt: prompt,
                    apiKey: settings.geminiApiKey
                }
            }, response => {
                if (response.data) {
                    showPopup(response.data);
                } else if (response.error) {
                    showPopup(`Error: ${response.error.message}`);
                }
                promptInputArea.remove();
            });
        } catch (error) {
            showPopup(`Error: ${error.message}`);
            promptInputArea.remove();
        }
    });

    const closePromptButton = document.getElementById('closePromptButton');
    closePromptButton.addEventListener('click', () => {
        promptInputArea.remove();
    });
}

async function getImageData(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const mimeType = blob.type;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Content = reader.result.split(',')[1];
                resolve({ base64Content, mimeType });
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