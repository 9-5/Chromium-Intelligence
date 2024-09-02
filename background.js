const aiAssistantPrompts = {
    'Proofread': [
        'Proofread this:\n\n',
        'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Rewrite': [
        'Rewrite this:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Friendly Tone': [
        'Make this sound more friendly:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more friendly. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more professional. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user concisely. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Sentiment Analysis': [
        'Analyze the sentiment of this:\n\n',
        'You are a sentiment analysis assistant. Analyze the sentiment of the text provided by the user. Output ONLY the sentiment analysis result without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate': [
        'Translate this into English:\n\n',
        'You are a translation assistant. Translate the text provided by the user into English. Output ONLY the translated text without any additional comments. If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant-context-menu",
        title: "AI Assistant",
        contexts: ["selection", "image", "link"]
    });

    const menuItemDetails = {
        contexts: ["selection"],
        parentId: "ai-assistant-context-menu",
    };

    for (const key in aiAssistantPrompts) {
        chrome.contextMenus.create({
            id: `ai-assistant-${key}`,
            title: key,
            ...menuItemDetails
        });
    }

    chrome.contextMenus.create({
        id: "ai-assistant-image",
        title: "Analyze Image",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-pdf",
        title: "Process PDF",
        contexts: ["link"]
    });
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId.startsWith('ai-assistant-')) {
        const action = data.menuItemId.replace('ai-assistant-', '');
        let selectedText = data.selectionText;

        if (action === 'image') {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: document.activeElement.src, fileType: 'image' });
                }
            });
        } else if (action === 'pdf') {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: document.activeElement.href, fileType: 'pdf' });
                }
            });
        } else {
            if (selectedText) {
                (async () => {
                    const settings = await new Promise((resolve) => {
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

                    let platform = settings.platform;
                    let model = settings.model;
                    const apiKey = settings[`${platform.toLowerCase().replace(/ /g, '')}ApiKey`];

                    if (!apiKey) {
                        alert(`Please set your API key for ${platform} in the extension settings.`);
                        chrome.runtime.openOptionsPage();
                        return;
                    }

                    const [prompt, systemPrompt] = aiAssistantPrompts[action];
                    const fullPrompt = `${prompt}${selectedText}`;

                    try {
                        let response = null;

                        switch (platform) {
                            case 'Gemini':
                                response = await apiHandlers.gemini.processText(fullPrompt, apiKey, model, systemPrompt);
                                break;
                            case 'Cloudflare Worker AI':
                                response = await apiHandlers.cloudflare.processText(fullPrompt, apiKey, settings.cloudflareId, model, systemPrompt);
                                break;
                            case 'OpenRouter':
                                response = await apiHandlers.openrouter.processText(fullPrompt, apiKey, model, systemPrompt);
                                break;
                        }

                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: (content) => {
                                chrome.runtime.sendMessage({ action: 'showPopup', data: content });
                            },
                            args: [response]
                        });

                    } catch (error) {
                        console.error('Error processing text:', error);
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: (errorMessage) => {
                                alert(`Error: ${errorMessage}`);
                            },
                            args: [error.message]
                        });
                    }
                })();
            } else {
                alert('Please select some text first.');
            }
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processPdf') {
        (async () => {
            try {
                const { pdfUrl, prompt, apiKey } = request.data;
                const response = await apiHandlers.gemini.processPdf(pdfUrl, prompt, apiKey);
                sendResponse({ data: response });
            } catch (error) {
                console.error('Error in background script:', error);
                sendResponse({ error: { message: error.message, details: error.toString() } });
            }
        })();
        
        return true;
    }
    if (request.action === 'processImage') {
        (async () => {
            try {
                const { base64Content, mimeType, prompt, apiKey } = request.data;
                const response = await apiHandlers.gemini.processImage(
                    base64Content,
                    mimeType,
                    prompt,
                    apiKey
                );
                sendResponse({ data: response });
            } catch (error) {
                console.error('Error in background script:', error);
                sendResponse({ error: { message: error.message, details: error.toString() } });
            }
        })();
        return true;
    }
});