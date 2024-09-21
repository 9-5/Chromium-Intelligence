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
    const promptBox = document.createElement('div');
    promptBox.id = 'ai-assistant-prompt-box';
    promptBox.innerHTML = `
        <label for="promptInput">Enter your prompt for the PDF:</label>
        <input type="text" id="promptInput" name="promptInput">
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process PDF</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptBox);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', () => {
        const prompt = document.getElementById('promptInput').value;
        promptBox.remove();

        getSettings().then(settings => {
            const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey } = settings;
            chrome.runtime.sendMessage({
                action: 'processPdf',
                data: {
                    fileUrl: fileUrl,
                    prompt: prompt,
                    apiKey: platform === 'Gemini' ? geminiApiKey : openrouterApiKey,
                    platform: platform,
                    model: model,
                    use_specific_model: use_specific_model,
                    custom_model: custom_model
                }
            }, (response) => {
                if (response.data) {
                    showPopup(response.data);
                } else if (response.error) {
                    showPopup(`Error: ${response.error.message}`);
                }
            });
        });
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptBox.remove();
    });

    function getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                'platform',
                'model',
                'use_specific_model',
                'custom_model',
                'geminiApiKey',
                'openrouterApiKey'
            ], resolve);
        });
    }
}

async function getImageData(imageUrl) {
    try {
        const response = await fetch(imageUrl);
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
            'openrouterApiKey'
        ], resolve);
    });
}