chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPopup') {
        showPopup(request.data);
    } else if (request.action === 'showPromptInput') {
        showPromptInput(request.fileUrl, request.fileType);
    } else if (request.action === 'processPdf') {
        processPdf(request.fileUrl, request.prompt);
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
    document.body.appendC
... (FILE CONTENT TRUNCATED) ...
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = `downloaded_file.${fileType}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}

async function processPdf(fileUrl, prompt) {
    try {
        const settings = await getSettings();
        const apiKey = settings.geminiApiKey;

        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        chrome.runtime.sendMessage({
            action: 'processPdf',
            data: { fileContent: uint8Array, prompt, apiKey }
        });
    } catch (error) {
        console.error("Error processing PDF:", error);
    }
}

async function getImageBase64(fileUrl, fileType) {
    try {
   
... (FILE CONTENT TRUNCATED) ...
}