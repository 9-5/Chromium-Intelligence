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

function showPromptInput(selectedText, fileType) {
    const promptInputArea = document.createElement('div');
    promptInputArea.id = 'ai-custom-prompt-input';
    promptInputArea.innerHTML = `
        <label for="customPrompt">Enter your custom prompt:</label>
        <textarea id="customPrompt" placeholder="Enter prompt here"></textarea>
        <div class="button-container">
            <button id="sendPromptButton" class="solarized-button">Send Prompt</button>
            <button id="cancelPromptButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInputArea);

    const sendPromptButton = document.getElementById('sendPromptButton');
    sendPromptButton.addEventListener('click', () => {
        const customPrompt = document.getElementById('customPrompt').value;
        
        chrome.runtime.sendMessage({
            action: 'processCustomPrompt',
            data: { selectedText: selectedText, customPrompt: customPrompt }
        }, response => {
            promptInputArea.remove();
            if (response && response.data) {
                showPopup(response.data);
            } else if (response && response.error) {
                showPopup(`Error: ${response.error.message}`);
            } else {
                showPopup('An error occurred.');
            }
        });
    });

    const cancelPromptButton = document.getElementById('cancelPromptButton');
    cancelPromptButton.addEventListener('click', () => {
        promptInputArea.remove();
    });
}

async function getImageData(fileUrl) {
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