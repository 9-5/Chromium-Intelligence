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
    const promptInput = document.createElement('div');
    promptInput.id = 'ai-assistant-prompt-input';
    promptInput.innerHTML = `
        <label for="promptText">Enter your prompt:</label>
        <textarea id="promptText"></textarea>
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', () => {
        const promptText = document.getElementById('promptText').value;
        processFile(fileUrl, fileType, promptText);
        promptInput.remove();
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function processFile(fileUrl, fileType, prompt) {
    try {
        let content;
        if (fileType === 'image') {
            content = await getImageContent(fileUrl);
            const { base64Content, mimeType } = content;
            const settings = await getSettings();
            const { platform, geminiApiKey } = settings;
            chrome.runtime.sendMessage({
                action: 'processImage',
                data: {
                    base64Content,
                    mimeType,
                    prompt,
                    apiKey: geminiApiKey
                }
            }, response => {
                if (response && response.data) {
                    showPopup(response.data);
                } else if (response && response.error) {
                    alert(`Error: ${response.error.message}`);
                }
            });
        } else {
            console.log("Unsupported file type");
            alert("Unsupported file type");
        }
    } catch (error) {
        console.error("Error processing file:", error);
        alert(`Error processing file: ${error.message}`);
    }
}

async function getImageContent(imageUrl) {
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