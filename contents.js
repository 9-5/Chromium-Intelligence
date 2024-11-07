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
        <textarea id="promptText" placeholder="Enter your prompt here"></textarea>
        <div class="button-container">
            <button id="sendButton" class="solarized-button">Send</button>
            <button id="closeButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', () => {
        const promptText = document.getElementById('promptText').value;
        processFile(fileUrl, fileType, promptText);
        promptInput.remove();
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function processFile(fileUrl, fileType, prompt) {
    try {
        const { base64Content, mimeType } = await getBase64(fileUrl);
        chrome.runtime.sendMessage({ action: 'processImage', data: { base64Content, mimeType, prompt } });
    } catch (error) {
        console.error("Error processing file:", error);
    }
}

async function getBase64(fileUrl) {
    try {
        const response = await fetch(fileUrl);
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