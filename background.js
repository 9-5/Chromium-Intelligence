const aiAssistantPrompts = {
    'Proofread': [
        'Proofread this:\n\n',
        'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Rewrite': [
        'Rewrite this:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with proofreading (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Friendly': [
        'Make this more friendly:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more friendly. Output ONLY the revised text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with rewriting (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional': [
        'Make this more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to sound more professional. Output ONLY the revised text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise. Output ONLY the concise version without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summary': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Provide a concise summary of the text provided by the user. Output ONLY the summary without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with summarization (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Key Points': [
        'Extract key points from this:\n\n',
        'You are an assistant that extracts key points from text provided by the user. Output ONLY the key points without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with extracting key points (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Stepify': [
        'Convert this into a step-by-step guide:\n\n',
        'You are an assistant that converts text provided by the user into a step-by-step guide. Output ONLY the steps without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this with conversion, output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        makeApiCall: async (systemPrompt, prePrompt, textInput, apiKey) => {
            const settings = await getSettings();
            const selectedModel = settings.use_specific_model ? settings.custom_model : settings.model;

            const requestBody = {
                "system_instruction": {
                    "parts": {
                        "text": systemPrompt
                    }
                },
                "contents": {
                    "parts": {
                        "text": `${prePrompt}${textInput}`
                    }
                }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('No valid response from Gemini API');
            }
        },

        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            const settings = await getSettings();
            const selectedModel = settings.use_specific_model ? settings.custom_model : settings.model;

            const requestBody = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mimeType,
                                "data": base64Content
                            }
                        }
                    ]
                }]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error(`Invalid API response: ${JSON.stringify(data)}`);
            }
        }
    },
    openrouter: {
        makeApiCall: async (systemPrompt, prePrompt, textInput, apiKey, model) => {
            const requestBody = {
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `${prePrompt}${textInput}` }
                ]
            };

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('No valid response from OpenRouter API');
            }
        }
    },
    cloudflare: {
        makeApiCall: async (systemPrompt, prePrompt, textInput, apiKey, accountId, model) => {
            const requestBody = {
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `${prePrompt}${textInput}` }
                ]
            };

            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            if (data.success && data.result && data.result.response) {
                return data.result.response;
            } else {
                throw new Error('No valid response from Cloudflare API');
            }
        }
    }
};

chrome.runtime.onInstalled.addListener(() => {
    updateContextMenus();
});

chrome.action.onClicked.addListener((tab) => {
    chrome.runtime.openOptionsPage();
});

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

async function makeApiCall(systemPrompt, prePrompt, textInput, callback) {
    try {
        const settings = await getSettings();
        const platform = settings.platform?.toLowerCase().replace(/\s+/g, '') || 'gemini';
        
        const platformMap = {
            'gemini': 'gemini',
            'cloudflareworkerai': 'cloudflare',
            'openrouter': 'openrouter'
        };

        const handlerKey = platformMap[platform];
        if (!handlerKey || !apiHandlers[handlerKey]) {
            throw new Error(`Unsupported platform: ${settings.platform}`);
        }

        const handler = apiHandlers[handlerKey];
        let apiKey, model, accountId;

        switch (handlerKey) {
            case 'gemini':
                apiKey = settings.gemini_api_key;
                model = settings.use_specific_model ? settings.custom_model : settings.model;
                break;
            case 'openrouter':
                apiKey = settings.openrouter_api_key;
                model = settings.custom_model;
                break;
            case 'cloudflare':
                apiKey = settings.cloudflare_api_key;
                accountId = settings.cloudflare_id;
                model = settings.custom_model;
                break;
        }

        if (!apiKey) {
            throw new Error('API key not found');
        }

        const response = await handler.makeApiCall(systemPrompt, prePrompt, textInput, apiKey, accountId, model);
        callback(null, response);
    } catch (error) {
        callback(error.toString(), null);
    }
}

function updateContextMenus() {
    chrome.contextMenus.removeAll(() => {
        for (const option in aiAssistantPrompts) {
            chrome.contextMenus.create({
                id: option,
                title: option,
                contexts: ["selection"],
            });
        }

        chrome.contextMenus.create({
            id: "processImage",
            title: "Process Image",
            contexts: ["image"]
        });

        chrome.contextMenus.create({
            id: "processPDF",
            title: "Process PDF",
            contexts: ["link"]
        });
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId in aiAssistantPrompts) {
        const textInput = info.selectionText;
        const [prePrompt, systemPrompt] = aiAssistantPrompts[info.menuItemId];

        makeApiCall(systemPrompt, prePrompt, textInput, (error, response) => {
            if (error) {
                console.error('Error:', error);
                chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error}` });
            } else {
                chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: response });
            }
        });
    } else if (info.menuItemId === "processImage" || info.menuItemId === "processPDF") {
        chrome.tabs.sendMessage(tab.id, {
            action: 'showPromptInput',
            fileUrl: info.srcUrl || info.linkUrl,
            fileType: info.menuItemId === "processImage" ? "image" : "pdf"
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchUrl') {
        (async () => {
            try {
                const response = await fetch(request.url);
                const blob = await response.blob();
                
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        sendResponse({data: reader.result});
                        resolve();
                    };
                    reader.onerror = () => {
                        sendResponse({error: 'Failed to read file'});
                        resolve();
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                sendResponse({error: error.toString()});
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
        return true; // Required to use sendResponse asynchronously
    }
});