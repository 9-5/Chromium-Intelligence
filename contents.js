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
        navigator.clipboard.writeText(responseText.value).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
}

async function showPromptInput(fileUrl, fileType) {
    const settings = await getSettings();
    const prompt = `
        <div id="ai-assistant-prompt-input">
            <label for="ai-prompt-select">Choose an AI action:</label>
            <select id="ai-prompt-select">
                <option value="Proofread">Proofread</option>
                <option value="Rewrite">Rewrite</option>
                <option value="Make Friendly">Make Friendly</option>
                <option value="Make Professional">Make Professional</option>
                <option value="Make Concise">Make Concise</option>
                <option value="Summarize">Summarize</option>
                <option value="Translate to French">Translate to French</option>
                <option value="Translate to German">Translate to German</option>
                <option value="Translate to Spanish">Translate to Spanish</option>
                <option value="Sentiment Analysis">Sentiment Analysis</option>
                <option value="Keyword Extraction">Keyword Extraction</option>
                <option value="Question Answering">Question Answering</option>
            </select>
            <br>
            <label for="ai-prompt-question" style="display: none;">Question:</label>
            <input type="text" id="ai-prompt-question" style="display: none;">
            <br>
            <button id="ai-process-button" class="solarized-button">Process</button>
            <button id="ai-cancel-button" class="solarized-button">Cancel</button>
        </div>
    `;

    const promptInput = document.createElement('div');
    promptInput.id = 'ai-assistant-prompt-input-container';
    promptInput.innerHTML = prompt;
    document.body.appendChild(promptInput);

    const aiPromptSelect = document.getElementById('ai-prompt-select');
    const aiPromptQuestionLabel = document.getElementById('ai-prompt-question');
    const aiPromptQuestionInput = document.getElementById('ai-prompt-question');

    aiPromptSelect.addEventListener('change', function() {
        if (aiPromptSelect.value === 'Question Answering') {
            aiPromptQuestionLabel.style.display = 'block';
            aiPromptQuestionInput.style.display = 'block';
        } else {
            aiPromptQuestionLabel.style.display = 'none';
            aiPromptQuestionInput.style.display = 'none';
        }
    });

    const aiProcessButton = document.getElementById('ai-process-button');
    aiProcessButton.addEventListener('click', async () => {
        try {
            let responseText;
            if (fileType === 'text') {
                let selectedText = fileUrl;
                const aiPrompt = document.getElementById('ai-prompt-select').value;

                if (aiPrompt === 'Question Answering') {
                    const question = document.getElementById('ai-prompt-question').value;
                    if (!question) {
                        alert('Please enter a question.');
                        return;
                    }
                    aiAssistantPrompts['Question Answering'][0] = `Answer the following question based on the context provided. Question: ${question}. Context:\n\n`;
                }

                chrome.runtime.sendMessage({
                    action: 'processText',
                    data: {
                        selectedText: selectedText,
                        aiPrompt: aiPrompt,
                        settings: settings
                    }
                }, response => {
                    if (response && response.data) {
                        showPopup(response.data);
                    } else if (response && response.error) {
                        alert(`Error: ${response.error.message}. Details: ${response.error.details}`);
                    } else {
                        alert('An unknown error occurred.');
                    }
                });
            } else if (fileType === 'image') {
                const aiPrompt = prompt('Describe the image:');
                if (aiPrompt) {
                    const { base64Content, mimeType } = await convertImageToBase64(fileUrl);
                    chrome.runtime.sendMessage({
                        action: 'processImage',
                        data: {
                            base64Content: base64Content,
                            mimeType: mimeType,
                            prompt: aiPrompt,
                            apiKey: settings.geminiApiKey
                        }
                    }, response => {
                        if (response && response.data) {
                            showPopup(response.data);
                        } else if (response && response.error) {
                            alert(`Error: ${response.error.message}. Details: ${response.error.details}`);
                        } else {
                            alert('An unknown error occurred.');
                        }
                    });
                }
            } else if (fileType === 'pdf') {
                const aiPrompt = prompt('Describe the PDF:');
                if (aiPrompt) {
                    try {
                        const { base64Content, mimeType } = await fetchPdfContent(fileUrl);
                        chrome.runtime.sendMessage({
                            action: 'processImage',
                            data: {
                                base64Content: base64Content,
                                mimeType: mimeType,
                                prompt: aiPrompt,
                                apiKey: settings.geminiApiKey
                            }
                        }, response => {
                            if (response && response.data) {
                                showPopup(response.data);
                            } else if (response && response.error) {
                                alert(`Error: ${response.error.message}. Details: ${response.error.details}`);
                            } else {
                                alert('An unknown error occurred.');
                            }
                        });
                    } catch (error) {
                        alert(`Error processing PDF: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            promptInput.remove();
        }
    });

    const aiCancelButton = document.getElementById('ai-cancel-button');
    aiCancelButton.addEventListener('click', () => {
        promptInput.remove();
    });
}

async function fetchPdfContent(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Content = reader.result.split(',')[1];
                const mimeType = 'application/pdf';
                resolve({ base64Content, mimeType });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        throw new Error(`Failed to fetch PDF: ${error.message}`);
    }
}

async function convertImageToBase64(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
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
            'geminiApiKey',
            'openrouterApiKey',
            'cloudflareId',
            'cloudflareApiKey'
        ], resolve);
    });
}