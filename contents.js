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

function processFile(fileUrl, fileType, prompt) {
    const processMap = {
        'image': processImage,
        'pdf': processPDF
    };
    if (processMap[fileType]) {
        processMap[fileType](fileUrl, prompt);
    }
}

function processImage(imageUrl, prompt) {
    toDataURL(imageUrl, dataUrl => {
        const base64Content = dataUrl.split(',')[1];
        sendApiRequest(base64Content, 'image/png', prompt);
    });
}

function processPDF(pdfUrl, prompt) {
    chrome.runtime.sendMessage({ action: 'fetchUrl', url: pdfUrl }, response => {
        if (response.error) {
            console.error('Error fetching PDF:', response.error);
            showPopup('Error: Unable to fetch PDF file');
        } else {
            const base64Content = response.data.split(',')[1];
            sendApiRequest(base64Content, 'application/pdf', prompt);
        }
    });
}

function sendApiRequest(base64Content, mimeType, prompt) {
    chrome.storage.sync.get('api_key', data => {
        const apiKey = data.api_key;
        if (!apiKey) {
            showPopup('API key not found');
            return;
        }
        const requestBody = {
            contents: [{
                parts: [
                    { inlineData: { mimeType, data: base64Content } },
                    { text: prompt }
                ]
            }]
        };
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response from API';
            showPopup(content);
        })
        .catch(error => {
            console.error('Error:', error);
            showPopup(`Error: ${error.toString()}`);
        });
    });
}

function toDataURL(src, callback, outputFormat) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);
        callback(canvas.toDataURL(outputFormat));
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}
