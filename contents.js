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
        navigator.clipboard.writeText(content.text)
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
        <textarea id="promptText" placeholder="Enter your prompt here"></textarea>
        <div class="button-container">
            <button id="processButton" class="solarized-button">Process</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const processButton = document.getElementById('processButton');
    processButton.addEventListener('click', () => {
        const promptText = document.getElementById('promptText').value;
        promptInput.remove();

        chrome.scripting.executeScript({
            target: { tabId: chrome.devtools.inspectedWindow.tabId },
            function: showPopup,
            args: [{
                text: `Loading...`
            }]
        });
        
        if (fileType === 'image') {
            getImageData(fileUrl).then(({ base64Content, mimeType }) => {
                getSettings().then(settings => {
                    chrome.runtime.sendMessage({
                        action: 'processImage',
                        data: {
                            base64Content: base64Content,
                            mimeType: mimeType,
                            prompt: promptText,
                            apiKey: settings.geminiApiKey
                        }
                    }, response => {
                        if (response && response.data) {
                            chrome.scripting.executeScript({
                                target: { tabId: chrome.devtools.inspectedWindow.tabId },
                                function: showPopup,
                                args: [{
                                    text: response.data
                                }]
                            });
                        } else if (response && response.error) {
                            chrome.scripting.executeScript({
                                target: { tabId: chrome.devtools.inspectedWindow.tabId },
                                function: showPopup,
                                args: [{
                                    text: `ERROR! ${response.error.message}`
                                }]
                            });
                        }
                    });
                });
            });
        } else if (fileType === 'pdf') {
            getPDFText(fileUrl).then(text => {
                getSettings().then(settings => {
                     chrome.runtime.sendMessage({
                        action: 'processText',
                        data: {
                            text: text,
                            prompt: promptText,
                            apiKey: settings.geminiApiKey,
                            platform: settings.platform,
                            model: settings.model
                        }
                    }, response => {
                        if (response && response.data) {
                            chrome.scripting.executeScript({
                                target: { tabId: chrome.devtools.inspectedWindow.tabId },
                                function: showPopup,
                                args: [{
                                    text: response.data
                                }]
                            });
                        } else if (response && response.error) {
                             chrome.scripting.executeScript({
                                target: { tabId: chrome.devtools.inspectedWindow.tabId },
                                function: showPopup,
                                args: [{
                                    text: `ERROR! ${response.error.message}`
                                }]
                            });
                        }
                    });
                });
            });
        }
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function getPDFText(url) {
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

async function getImageData(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const mimeType = blob.type;
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