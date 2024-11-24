const aiAssistantPrompts = {
    'Proofread': [
        'Proofread this:\n\n',
        'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Rewrite': [
        'Rewrite this:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Friendly': [
        'Make this sound more friendly:\n\n',
        'You are a writing assistant. Convert the text provided by the user to make it sound more friendly. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Convert the text provided by the user to make it sound more professional. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it more concise. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (text, prompt, apiKey) => {
            try {
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
                const response = await fetch(geminiApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt + text
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7
                        }
                    })
                });
    
                if (!response.ok) {
                    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
                }
    
                const data = await response.json();
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Unexpected response format from Gemini API');
                }
            } catch (error) {
                console.error('Gemini API Error:', error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            try {
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
                const imagePart = {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Content
                    }
                };
    
                const textPart = {
                    text: prompt
                };
    
                const response = await fetch(geminiApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [textPart, imagePart]
                        }],
                        generationConfig: {
                            temperature: 0.4
                        }
                    })
                });
    
                if (!response.ok) {
                    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
                }
    
                const data = await response.json();
    
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Unexpected response format from Gemini API');
                }
            } catch (error) {
                console.error('Gemini API Error:', error);
                throw error;
            }
        }
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant-text",
        title: "AI Assistant: %s",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-image",
        title: "AI Assistant (Image)",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-link",
        title: "AI Assistant (PDF Link)",
        contexts: ["link"],
        documentUrlPatterns: ["*://*/*.pdf"]
    });
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId === "ai-assistant-text") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                getSettings().then(settings => {
                    chrome.runtime.sendMessage({ action: 'showPopup', data: { selectedText: window.getSelection().toString(), settings: settings } });
                });
            }
        });
    } else if (data.menuItemId === "ai-assistant-image") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                getSettings().then(settings => {
                    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: data.srcUrl, fileType: 'image', settings: settings });
                });
            }
        });
    } else if (data.menuItemId === "ai-assistant-link") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                getSettings().then(settings => {
                    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: data.linkUrl, fileType: 'pdf', settings: settings });
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, prompt, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = request.data;

                let apiKey;
                let response;

                if (platform === 'Gemini') {
                    apiKey = geminiApiKey;
                    response = await apiHandlers.gemini.processText(selectedText, prompt, apiKey);
                } else if (platform === 'Cloudflare Worker AI') {
                    // Placeholder
                    response = 'Cloudflare Worker AI processing is not yet implemented.';
                } else if (platform === 'OpenRouter') {
                    // Placeholder
                    response = 'OpenRouter processing is not yet implemented.';
                } else {
                    sendResponse({ error: 'Invalid platform selected.' });
                    return;
                }

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