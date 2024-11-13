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
        document.body.removeChild(popup);
    });
}

async function showPromptInput(fileUrl, fileType) {
    const prompt = window.prompt("Enter your prompt:", "Describe this image");
    if (prompt) {
        if (fileType === 'text') {
            processText(fileUrl, prompt);
        }
        if (fileType === 'image') {
            processImage(fileUrl, prompt);
        }
    }
}

async function processText(text, prompt) {
    try {
        const settings = await getSettings();
        const apiKey = settings.geminiApiKey;

        chrome.runtime.sendMessage({
            action: 'processText',
            data: { text: text, prompt: prompt, apiKey: apiKey }
        });
    } catch (error) {
        console.error("Error processing text:", error);
    }
}

async function processImage(fileUrl, prompt) {
    try {
        const settings = await getSettings();
        const apiKey = settings.geminiApiKey;

        const { base64Content, mimeType } = await getImageBase64(fileUrl);

        chrome.runtime.sendMessage({
            action: 'processImage',
            data: { base64Content, mimeType, prompt, apiKey }
        });

    } catch (error) {
        console.error("Error processing image:", error);
    }
}

async function getImageBase64(fileUrl) {
    try {
        const response = await fetch(fileUrl);
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