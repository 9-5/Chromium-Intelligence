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
                console.error('Failed to copy content: ', err);
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
        <label for="promptText">Enter your prompt:</label>
        <textarea id="promptText" placeholder="Enter your prompt here"></textarea>
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', async () => {
        const promptText = document.getElementById('promptText').value;
        const settings = await getSettings();

        let platform = settings.platform;
        let model = settings.model;
        const apiKey = settings[`${platform.toLowerCase().replace(/ /g, '')}ApiKey`];

        if (!apiKey) {
            alert(`Please set your API key for ${platform} in the extension settings.`);
            chrome.runtime.openOptionsPage();
            promptInput.remove();
            return;
        }

        if (fileType === 'image') {
            try {
                const { base64Content, mimeType } = await getImageData(fileUrl);
                chrome.runtime.sendMessage({
                    action: 'processImage',
                    data: {
                        base64Content: base64Content,
                        mimeType: mimeType,
                        prompt: promptText,
                        apiKey: apiKey
                    }
                }, (response) => {
                    if (response && response.data) {
                        showPopup(response.data);
                    } else if (response && response.error) {
                        alert(`Error: ${response.error.message}`);
                    } else {
                        alert('An unexpected error occurred.');
                    }
                });
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        } else if (fileType === 'pdf') {
            chrome.runtime.sendMessage({
                action: 'processPdf',
                data: {
                    pdfUrl: fileUrl,
                    prompt: promptText,
                    apiKey: apiKey
                }
            }, (response) => {
                if (response && response.data) {
                    showPopup(response.data);
                } else if (response && response.error) {
                    alert(`Error: ${response.error.message}`);
                } else {
                    alert('An unexpected error occurred.');
                }
            });
        }
        promptInput.remove();
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function getImageData(imageUrl) {
    try {
        const response = await fetch(imageUrl);
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