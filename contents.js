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
    const promptInput = document.createElement('div');
    promptInput.id = 'ai-assistant-prompt-input';
    promptInput.innerHTML = `
        <div class="prompt-container">
            <textarea id="promptText" placeholder="Enter your prompt here..."></textarea>
            <div class="button-container">
                <button id="processButton" class="solarized-button">Process</button>
                <button id="cancelButton" class="solarized-button">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(promptInput);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', async () => {
        const prompt = document.getElementById('promptText').value;
        if (fileType === 'image') {
            try {
                const { base64Content, mimeType } = await getBase64FromImageUrl(fileUrl);
                const settings = await getSettings();
                const { geminiApiKey } = settings;

                chrome.runtime.sendMessage({
                    action: 'processImage',
                    data: { base64Content, mimeType, prompt, apiKey: geminiApiKey }
                }, response => {
                    if (chrome.runtime.lastError) {
                        console.error("Error in content script:", chrome.runtime.lastError);
                        return;
                    }
                    if (response && response.data) {
                        showPopup(response.data);
                    } else if (response && response.error) {
                        showPopup(`Error: ${response.error.message}`);
                    } else {
                        showPopup('An unknown error occurred.');
                    }
                });
            } catch (error) {
                showPopup(`Error: ${error.message}`);
            }
        } else if (fileType === 'text') {
            showPopup(prompt);
        } else if (fileType === 'pdf') {
            showPopup('PDF processing is not yet implemented.');
        } else if (fileType === 'link') {
            showPopup('Link processing is not yet implemented.');
        }
        promptInput.remove();
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function getBase64FromImageUrl(imageUrl) {
    try {
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
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