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
        navigator.clipboard.writeText(document.getElementById('responseText').value)
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
            <button id="sendPromptButton" class="solarized-button">Send</button>
            <button id="closePromptButton" class="solarized-button">Close</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const sendPromptButton = document.getElementById('sendPromptButton');
    sendPromptButton.addEventListener('click', () => {
        const promptText = document.getElementById('promptText').value;
        processFile(fileUrl, fileType, promptText);
        promptInput.remove();
    });

    const closePromptButton = document.getElementById('closePromptButton');
    closePromptButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function processFile(fileUrl, fileType, prompt) {
    try {
        if (fileType === 'pdf') {
            const pdfBlob = await fetch(fileUrl).then(r => r.blob());
            const { base64Content, mimeType } = await convertBlobToBase64(pdfBlob, 'application/pdf');
             const settings = await getSettings();
                chrome.runtime.sendMessage({
                    action: 'processImage',
                    data: {
                        base64Content: base64Content,
                        mimeType: mimeType,
                        prompt: prompt,
                        apiKey: settings.geminiApiKey
                    }
                }, response => {
                    if (chrome.runtime.lastError) {
                        console.error("Error in background script:", chrome.runtime.lastError.message);
                    }
                    if (response && response.data) {
                        showPopup(response.data);
                    } else if (response && response.error) {
                         showPopup(response.error.message);
                    } else {
                        showPopup('No response received from background script.');
                    }
                });
        } else {
            console.log('Unsupported file type');
        }
    } catch (error) {
        console.error("Error processing file:", error);
        showPopup(`Error processing file: ${error.message}`);
    }
}

async function convertBlobToBase64(blob, mimeType) {
    try {
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