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
        'You are a text rewriting assistant. Rewrite the text provided by the user to be more friendly, approachable, and casual. Focus on making the tone more inviting. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to be more professional, formal, and suitable for business contexts. Focus on using precise language and avoiding colloquialisms. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to be more concise and to-the-point, removing unnecessary words or phrases. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user, capturing the main points and key details. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Sentiment Analysis': [
        'Analyze the sentiment of this:\n\n',
        'You are a sentiment analysis assistant. Analyze the text provided by the user and determine its overall sentiment (positive, negative, or neutral). Output ONLY the sentiment detected without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (text, prompt, apiKey) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
            const data = {
                contents: [{
                    parts: [{ text: prompt + text }]
                }],
                generationConfig: {
                    temperature: 0.7
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            try {
                return json.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error("Gemini JSON response:", json);
                throw new Error("Unexpected response format from Gemini. Check the console for the full response.");
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;

            const data = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Content
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topP: 1,
                    topK: 32,
                    maxOutputTokens: 4096,
                },
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();

            try {
                return json.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error("Gemini JSON response:", json);
                throw new Error("Unexpected response format from Gemini. Check the console for the full response.");
            }
        }
    },
    openrouter: {
        processText: async (text, prompt, apiKey, model) => {
            const url = 'https://api.openrouter.ai/api/v1/chat/completions';
            const headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };

            const data = {
                model: model,
                messages: [{
                    role: "user",
                    content: prompt + text
                }],
                temperature: 0.7
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            try {
                return json.choices[0].message.content;
            } catch (error) {
                console.error("OpenRouter JSON response:", json);
                throw new Error("Unexpected response format from OpenRouter. Check the console for the full response.");
            }
        }
    },
    cloudflare: {
        processText: async (text, prompt, accountId, apiToken, model) => {
            const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
            const headers = {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            };
            const data = {
                messages: [{
                    role: "user",
                    content: prompt + text
                }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();

            try {
                return json.result.response;
            } catch (error) {
                console.error("Cloudflare JSON response:", json);
                throw new Error("Unexpected response format from Cloudflare. Check the console for the full response.");
            }
        }
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant",
        title: "AI Assistant",
        contexts: ["selection", "image", "link"]
    });

    for (const key in aiAssistantPrompts) {
        chrome.contextMenus.create({
            id: `ai-assistant-${key}`,
            title: key,
            parentId: "ai-assistant",
            contexts: ["selection"]
        });
    }
});

chrome.contextMenus.onClicked.addListener(async (data, tab) => {
    let selectedText = data.selectionText;
    let menuItemId = data.menuItemId;
    let promptKey = menuItemId.split('ai-assistant-')[1];

    if (promptKey) {
        try {
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

            let apiResponse;
            let platform = settings.platform;
            let model = settings.model;

            if (settings.use_specific_model && settings.custom_model) {
                model = settings.custom_model;
            }

            if (platform === 'Gemini') {
                apiResponse = await apiHandlers.gemini.processText(
                    selectedText,
                    aiAssistantPrompts[promptKey][0],
                    settings.geminiApiKey
                );
            } else if (platform === 'OpenRouter') {
                apiResponse = await apiHandlers.openrouter.processText(
                    selectedText,
                    aiAssistantPrompts[promptKey][0],
                    settings.openrouterApiKey,
                    model
                );
            } else if (platform === 'Cloudflare Worker AI') {
                apiResponse = await apiHandlers.cloudflare.processText(
                    selectedText,
                    aiAssistantPrompts[promptKey][0],
                    settings.cloudflareId,
                    settings.cloudflareApiKey,
                    model
                );
            }

            if (apiResponse) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: showPopup,
                    args: [apiResponse]
                });
            } else {
                throw new Error('No response from AI platform.');
            }

        } catch (error) {
            console.error('Error processing text:', error);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPopup,
                args: [`Error: ${error.message}`]
            });
        }
    }

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { text, prompt, platform, model, apiKey } = request.data;
                let response;

                if (platform === 'Gemini') {
                    response = await apiHandlers.gemini.processText(text, prompt, apiKey);
                } else if (platform === 'OpenRouter') {
                    response = await apiHandlers.openrouter.processText(text, prompt, apiKey, model);
                } else if (platform === 'Cloudflare Worker AI') {
                    response = await apiHandlers.cloudflare.processText(text, prompt, request.data.cloudflareId, request.data.cloudflareApiKey, model);
                } else {
                    throw new Error('Invalid platform selected.');
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