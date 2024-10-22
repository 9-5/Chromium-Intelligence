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
    promptInputArea.id = 'ai-assistant-prompt-input';
    promptInputArea.innerHTML = `
        <label for="promptInput">Enter your prompt for the ${fileType} file:</label>
        <input type="text" id="promptInput" placeholder="e.g., Summarize this document">
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInputArea);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', () => {
        const prompt = document.getElementById('promptInput').value;
        promptInputArea.remove();
        processFile(fileUrl, fileType, prompt);
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInputArea.remove();
    });
}

async function processFile(fileUrl, fileType, prompt) {
    try {
        const settings = await getSettings();
        const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = settings;
        let responseText;

        if (fileType === 'pdf') {
            responseText = "PDF Processing is in progress."
             chrome.runtime.sendMessage({ action: 'showPopup', data: responseText });
        }

        if (fileType === 'image') {
            responseText = "Image Processing is in progress."
            chrome.runtime.sendMessage({ action: 'showPopup', data: responseText });
        }

    } catch (error) {
        console.error("Error processing file:", error);
        chrome.runtime.sendMessage({ action: 'showPopup', data: `Error: ${error.message}` });
    }
}

async function fetchImageAsBase64(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
           const mimeType = blob.type;
           console.log("MIME Type:", mimeType);
       
           // Proceed with FileReader only for valid image types
           if (!mimeType.startsWith('image/')) {
               reject(new Error(`Invalid image MIME type: ${mimeType}`));
               return;
           }
       
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