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
        responseText.select();
        document.execCommand('copy');
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
}

function showPromptInput(fileUrl, fileType) {
    let prompt = prompt("Enter your prompt:");

    if (prompt) {
        if (fileType === 'text') {
            processText(fileUrl, prompt);
        } else if (fileType === 'image') {
            processImage(fileUrl, prompt);
        }
    }
}

async function processText(text, prompt) {
    chrome.runtime.sendMessage({
        action: 'processText',
        data: { text: text, prompt: prompt }
    }, (response) => {
        if (response && response.data) {
            showPopup(response.data);
        } else if (response && response.error) {
            showPopup(`Error: ${response.error.message}`);
        } else {
            showPopup('An unknown error occurred.');
        }
    });
}

async function processImage(imageUrl, prompt) {
    try {
        const { base64Content, mimeType } = await getImageData(imageUrl);
        chrome.runtime.sendMessage({
            action: 'processImage',
            data: { base64Content: base64Content, mimeType: mimeType, prompt: prompt }
        }, (response) => {
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
            'openrouterApiKey',
            'cloudflareId',
            'cloudflareApiKey'
        ], resolve);
    });
}