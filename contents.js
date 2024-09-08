chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPopup') {
        showPopup(request.data);
    } else if (request.action === 'showPromptInput') {
        showPromptInput(request.fileUrl, request.fileType);
    } else if (request.action === 'getTextSelection') {
        (async () => {
            try {
                const settings = await getSettings();
                chrome.runtime.sendMessage({
                    action: 'processText',
                    data: {
                        selectedText: request.selectedText,
                        aiAction: request.aiAction,
                        apiKey: settings.geminiApiKey
                    }
                });
                sendResponse({ success: true });
            } catch (error) {
                console.error("Error processing text:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
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
    const popup = document.createElement('div');
    popup.id = 'ai-assistant-prompt-input';
    popup.innerHTML = `
        <textarea id="promptText" placeholder="Enter your prompt here"></textarea>
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process</button>
            <button id="closeButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(popup);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', async () => {
        const promptText = document.getElementById('promptText').value;
        if (promptText) {
            try {
                const { base64Content, mimeType } = await fetchAndConvertFile(fileUrl, fileType);
                const settings = await getSettings();
                chrome.runtime.sendMessage({
                    action: 'processImage',
                    data: {
                        base64Content: base64Content,
                        mimeType: mimeType,
                        prompt: promptText,
                        apiKey: settings.geminiApiKey
                    }
                });
                popup.remove();
            } catch (error) {
                console.error("Error processing PDF:", error);
                alert("Failed to process PDF. Please check the console for details.");
            }
        } else {
            alert("Please enter a prompt.");
        }
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
}

async function fetchAndConvertFile(fileUrl, fileType) {
    try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        return await convertBlobToBase64(blob);
    } catch (error) {
        throw new Error(`Failed to fetch file: ${error.message}`);
    }
}

function convertBlobToBase64(blob) {
    try {
        return new Promise((resolve, reject) => {
            const mimeType = blob.type || 'application/octet-stream';
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Content = reader.result.split(',')[1];
                resolve({ base64Content, mimeType });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        throw new Error(`Failed to convert blob to base64: ${error.message}`);
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