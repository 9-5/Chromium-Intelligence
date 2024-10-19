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
        'You are a writing assistant. Rewrite the text provided by the user to have a friendly tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to have a professional tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this in a more concise way:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant-context-menu",
        title: "AI Assistant",
        contexts: ["selection", "image", "link"]
    });

    for (const key in aiAssistantPrompts) {
        chrome.contextMenus.create({
            id: `ai-assistant-${key}`,
            title: key,
            parentId: "ai-assistant-context-menu",
            contexts: ["selection"]
        });
    }
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId === "ai-assistant-context-menu") {
        // Do nothing
    } else {
        let selectedText = data.selectionText;
        if (selectedText) {
            let menuItemId = data.menuItemId.replace('ai-assistant-', '');
        
            getSettings().then(settings => {
                const { platform, model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = settings;
                let apiKey;
        
                if (platform === 'Gemini') {
                    apiKey = geminiApiKey;
                } else if (platform === 'OpenRouter') {
                    apiKey = openrouterApiKey;
                } else if (platform === 'Cloudflare Worker AI') {
                    apiKey = cloudflareApiKey;
                }
                
                if (!apiKey) {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            alert('API key is missing. Please set it in the extension options.');
                        }
                    });
                    return;
                }
                
                const prompt = aiAssistantPrompts[menuItemId][0] + selectedText;
                const apiHandler = apiHandlers[platform.toLowerCase().replace(/ /g, '')];
        
                if (!apiHandler) {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            alert(`Platform "${platform}" is not yet implemented.`);
                        }
                    });
                    return;
                }
                
                apiHandler.processText(prompt, apiKey, model)
                .then(response => {
                    chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: response });
                })
                .catch(error => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            alert(`Error: ${error.message}`);
                        }
                    });
                });
            });
        }
    }
});

const apiHandlers = {
    gemini: {
        processText: async (prompt, apiKey, model) => {
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 1,
                            topP: 0.8,
                            maxOutputTokens: 2048
                        }
                    })
                });
        
                if (!response.ok) {
                    let errorBody;
                    try {
                        errorBody = await response.json();
                    } catch (e) {
                        errorBody = await response.text();
                    }
        
                    console.error('Gemini API Error:', errorBody);
                    throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorBody)}`);
                }
        
                const data = await response.json();
        
                if (!data.candidates || data.candidates.length === 0) {
                    throw new Error('No candidates returned from Gemini API.');
                }
        
                const generatedText = data.candidates[0].content.parts[0].text;
                return generatedText;
        
            } catch (error) {
                console.error('Error processing text with Gemini API:', error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${apiKey}`;
    
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Content
                                    }
                                },
                                {
                                    text: prompt
                                }
                            ]
                        }]
                    })
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const data = await response.json();
                const generatedText = data.candidates[0].content.parts[0].text;
                return generatedText;
    
            } catch (error) {
                console.error("Error processing image:", error);
                throw error;
            }
        }
    },
    cloudflareworkerai: {
        processText: async (prompt, apiKey, model) => {
            try {
                const accountId = await new Promise((resolve) => {
                    chrome.storage.sync.get(['cloudflareId'], (items) => {
                        resolve(items.cloudflareId);
                    });
                });

                const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        prompt: prompt
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data.result.response;
            } catch (error) {
                console.error("Error processing text:", error);
                throw error;
            }
        }
    },
    openrouter: {
        processText: async (prompt, apiKey, model) => {
            try {
                const apiUrl = 'https://api.openrouter.ai/api/v1/chat/completions';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': 'https://0kb.org', // Replace with your actual site URL
                        'X-Title': 'Chromium AI Extension' // Replace with your actual product name
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{ role: "user", content: prompt }],
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error("Error processing text:", error);
                throw error;
            }
        }
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { prompt, platform, apiKey, model } = request.data;
                const apiHandler = apiHandlers[platform.toLowerCase().replace(/ /g, '')];
                const response = await apiHandler.processText(prompt, apiKey, model);
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