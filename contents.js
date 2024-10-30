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

    const style = document.createElement('style');
    style.textContent = `
        #ai-assistant-popup {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            background-color: #002b36;
            border: 1px solid #268bd2;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 10000;
            padding: 15px;
            font-family: Arial, sans-serif;
        }
        #ai-assistant-popup textarea {
            width: 100%;
            height: 150px;
            margin-bottom: 10px;
            background-color: #073642;
            color: #839496;
            border: 1px solid #586e75;
            padding: 8px;
            font-size: 14px;
            resize: vertical;
        }
        #ai-assistant-popup .button-container {
            display: flex;
            justify-content: space-between;
        }
        #ai-assistant-popup .solarized-button {
            background-color: #073642;
            color: #839496;
            border: 1px solid #268bd2;
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.3s, color 0.3s;
        }
        #ai-assistant-popup .solarized-button:hover {
            background-color: #268bd2;
            color: #002b36;
        }
        #ai-assistant-popup .solarized-button:active {
            background-color: #2aa198;
        }
    `;
    document.head.appendChild(style);

    popup.querySelector('#copyButton').addEventListener('click', () => {
        const responseText = popup.querySelector('#responseText');
        responseText.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
    });

    popup.querySelector('#closeButton').addEventListener('click', () => popup.remove());
}

function showPromptInput(fileUrl, fileType) {
    const promptInput = document.createElement('div');
    promptInput.id = 'ai-assistant-prompt-input';
    promptInput.innerHTML = `
        <textarea id="customPrompt" placeholder="Enter your prompt here..."></textarea>
        <button id="submitPrompt" class="solarized-button">Submit</button>
    `;
    document.body.appendChild(promptInput);

    const style = document.createElement('style');
    style.textContent = `
        #ai-assistant-prompt-input {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background-color: #002b36;
            border: 1px solid #268bd2;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 10000;
            padding: 15px;
            font-family: Arial, sans-serif;
        }
        #ai-assistant-prompt-input textarea {
            width: 100%;
            height: 100px;
            margin-bottom: 10px;
            background-color: #073642;
            color: #839496;
            border: 1px solid #586e75;
            padding: 8px;
            font-size: 14px;
            resize: vertical;
        }
        #ai-assistant-prompt-input .solarized-button {
            background-color: #073642;
            color: #839496;
            border: 1px solid #268bd2;
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.3s, color 0.3s;
        }
        #ai-assistant-prompt-input .solarized-button:hover {
            background-color: #268bd2;
            color: #002b36;
        }
        #ai-assistant-prompt-input .solarized-button:active {
            background-color: #2aa198;
        }
    `;
    document.head.appendChild(style);

    promptInput.querySelector('#submitPrompt').addEventListener('click', () => {
        const prompt = promptInput.querySelector('#customPrompt').value;
        processFile(fileUrl, fileType, prompt);
        promptInput.remove();
    });
}

async function processFile(fileUrl, fileType, prompt) {
    const settings = await getSettings();
    if (settings.platform === 'Gemini') {
        if (fileType === 'image') {
            processImage(fileUrl, prompt);
        } else if (fileType === 'pdf') {
            processPDF(fileUrl, prompt);
        }
    } else {
        showPopup('File processing is only supported for Gemini platform');
    }
}

async function processImage(imageUrl, prompt) {
    console.log('Processing image:', imageUrl);
    const settings = await getSettings();
    console.log('Settings:', settings);
    if (settings.platform === 'Gemini') {
        try {
            console.log('Fetching image...');
            const { base64Content, mimeType } = await getBase64Image(imageUrl);
            console.log('Image fetched successfully. MIME type:', mimeType);
            console.log('Calling Gemini API...');
            
            // Send message to background script
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'processImage',
                    data: {
                        base64Content,
                        mimeType,
                        prompt,
                        apiKey: settings.gemini_api_key
                    }
                }, response => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response.error) {
                        reject(new Error(JSON.stringify(response.error)));
                    } else {
                        resolve(response.data);
                    }
                });
            });

            console.log('Gemini API response received');
            showPopup(response);
        } catch (error) {
            console.error('Error processing image:', error);
            showPopup(`Error processing image: ${error.message}`);
        }
    } else {
        showPopup('Image processing is only supported for Gemini platform');
    }
}

async function processPDF(pdfUrl, prompt) {
    const settings = await getSettings();
    if (settings.platform === 'Gemini') {
        try {
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ action: 'fetchUrl', url: pdfUrl }, response => {
                    if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response.data);
                    }
                });
            });
            const base64Content = response.split(',')[1];
            const result = await apiHandlers.gemini.processImage(
                base64Content,
                'application/pdf',
                prompt,
                settings.gemini_api_key
            );
            showPopup(result);
        } catch (error) {
            showPopup(`Error: ${error.toString()}`);
        }
    } else {
        showPopup('PDF processing is only supported for Gemini platform');
    }
}

async function getBase64Image(imageUrl) {
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
            'gemini_api_key',
            'openrouter_api_key',
            'cloudflare_id',
            'cloudflare_api_key'
        ], resolve);
    });
}