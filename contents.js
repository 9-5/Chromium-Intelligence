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
    Object.assign(popup.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: '10000',
        padding: '10px'
    });
    popup.innerHTML = `
        <textarea id="responseText" readonly style="width: 100%; height: 100px;">${content}</textarea>
        <button id="copyButton">Copy to Clipboard</button>
        <button id="closeButton">Close</button>
    `;
    document.body.appendChild(popup);

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
    Object.assign(promptInput.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '10000',
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc'
    });
    promptInput.innerHTML = `
        <textarea id="customPrompt" style="width: 300px; height: 100px;" placeholder="Enter your prompt here..."></textarea>
        <button id="submitPrompt">Submit</button>
    `;
    document.body.appendChild(promptInput);

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
    const settings = await getSettings();
    if (settings.platform === 'Gemini') {
        const base64Content = await getBase64Image(imageUrl);
        const mimeType = 'image/png'; // Assuming PNG for simplicity
        try {
            const response = await apiHandlers.gemini.processImage(
                base64Content,
                mimeType,
                prompt,
                settings.gemini_api_key
            );
            showPopup(response);
        } catch (error) {
            showPopup(`Error: ${error.toString()}`);
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
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
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