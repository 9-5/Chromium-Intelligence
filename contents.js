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
    const promptInput = document.createElement('div');
    promptInput.id = 'ai-assistant-prompt-input';

    let contentArea = '';
    if (fileType === 'text') {
        contentArea = `<textarea id="promptText" placeholder="Enter your prompt here" autofocus>${fileUrl}</textarea>`;
    } else if (fileType === 'image') {
        contentArea = `<input type="text" id="promptText" placeholder="Describe the image..." autofocus>`;
    } else if (fileType === 'link') {
         contentArea = `<textarea id="promptText" placeholder="Enter your prompt here" autofocus>${fileUrl}</textarea>`;
    }

    promptInput.innerHTML = `
        ${contentArea}
        <div class="button-container">
            <button id="sendButton" class="solarized-button">Send</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', async () => {
        const promptText = document.getElementById('promptText').value;
        promptInput.remove();

        if (fileType === 'text') {
            getSettings().then(settings => {
                chrome.runtime.sendMessage({
                    action: 'processText',
                    data: {
                        selectedText: fileUrl,
                        prompt: aiAssistantPrompts['Proofread'][0] + promptText,
                        platform: settings.platform,
                        model: settings.model,
                        custom_model: settings.custom_model,
                        geminiApiKey: settings.geminiApiKey,
                        openrouterApiKey: settings.openrouterApiKey,
                        cloudflareId: settings.cloudflareId,
                        cloudflareApiKey: settings.cloudflareApiKey,
                        use_specific_model: settings.use_specific_model
                    }
                });
            });
        } else if (fileType === 'image') {
            try {
                const { base64Content, mimeType } = await getImageAsBase64(fileUrl);
                getSettings().then(settings => {
                    chrome.runtime.sendMessage({
                        action: 'processImage',
                        data: {
                            base64Content: base64Content,
                            mimeType: mimeType,
                            prompt: promptText,
                            apiKey: settings.geminiApiKey
                        }
                    }, (response) => {
                        if (response && response.data) {
                            showPopup(response.data);
                        } else if (response && response.error) {
                            showPopup(`Error: ${response.error.message} Details: ${response.error.details}`);
                        } else {
                            showPopup('An unexpected error occurred.');
                        }
                    });
                });
            } catch (error) {
                showPopup(`Error: ${error.message}`);
            }
        } else if (fileType === 'link') {
             getSettings().then(settings => {
                chrome.runtime.sendMessage({
                    action: 'processText',
                    data: {
                        selectedText: fileUrl,
                        prompt: aiAssistantPrompts['Proofread'][0] + promptText,
                        platform: settings.platform,
                        model: settings.model,
                        custom_model: settings.custom_model,
                        geminiApiKey: settings.geminiApiKey,
                        openrouterApiKey: settings.openrouterApiKey,
                        cloudflareId: settings.cloudflareId,
                        cloudflareApiKey: settings.cloudflareApiKey,
                        use_specific_model: settings.use_specific_model
                    }
                });
            });
        }
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function getImageAsBase64(imageUrl) {
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
            'openrouterApiKey',
            'cloudflareId',
            'cloudflareApiKey'
        ], resolve);
    });
}