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
                console.log('Content copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
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
        <input type="text" id="promptText" name="promptText">
        <div class="button-container">
            <button id="sendButton" class="solarized-button">Send</button>
            <button id="cancelButton" class="solarized-button">Cancel</button>
        </div>
    `;
    document.body.appendChild(promptInput);

    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', () => {
        const promptText = document.getElementById('promptText').value;
        promptInput.remove();

        if (fileType === 'image') {
            fetchImage(fileUrl)
                .then(({ base64Content, mimeType }) => {
                    getSettings().then(settings => {
                        chrome.runtime.sendMessage({
                            action: 'processImage',
                            data: {
                                base64Content: base64Content,
                                mimeType: mimeType,
                                prompt: promptText,
                                apiKey: settings.geminiApiKey
                            }
                        }, (response) => {
                            if (response.data) {
                                showPopup(response.data);
                            } else if (response.error) {
                                showPopup(`Error: ${response.error.message}`);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error("Error fetching image:", error);
                    showPopup(`Error fetching image: ${error.message}`);
                });
        } else if (fileType === 'pdf') {
            fetchPDFText(fileUrl)
            .then(pdfText => {
                getSettings().then(settings => {
                    chrome.runtime.sendMessage({
                        action: 'performAiAction',
                        data: {
                            selectedText: pdfText,
                            prompt: 'Summarize',
                            apiKey: settings.geminiApiKey,
                            platform: settings.platform,
                            model: settings.model,
                            useSpecificModel: settings.use_specific_model,
                            customModel: settings.custom_model
                        }
                    }, (response) => {
                        if (response.data) {
                            showPopup(response.data);
                        } else if (response.error) {
                            showPopup(`Error: ${response.error.message}`);
                        }
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching PDF:", error);
                showPopup(`Error fetching PDF: ${error.message}`);
            });
        } else {
            getSettings().then(settings => {
                chrome.runtime.sendMessage({
                    action: 'performAiAction',
                    data: {
                        selectedText: fileUrl,
                        prompt: promptText,
                        apiKey: settings.geminiApiKey,
                        platform: settings.platform,
                        model: settings.model,
                        useSpecificModel: settings.use_specific_model,
                        customModel: settings.custom_model
                    }
                }, (response) => {
                    if (response.data) {
                        showPopup(response.data);
                    } else if (response.error) {
                        showPopup(`Error: ${response.error.message}`);
                    }
                });
            });
        }
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function fetchPDFText(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            text += strings.join(" ") + "\n";
        }
        return text;
    } catch (error) {
        throw new Error(`Failed to fetch or process PDF: ${error.message}`);
    }
}

async function fetchImageAndShowPrompt(imageUrl) {
    try {
        const { base64Content, mimeType } = await fetchImage(imageUrl);
        showPromptInput(imageUrl, 'image');
    } catch (error) {
        console.error("Error fetching image:", error);
        showPopup(`Error fetching image: ${error.message}`);
    }
}

async function fetchImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Content = reader.result.split(',')[1];
                resolve({ base64Content, mimeType: blob.type });
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