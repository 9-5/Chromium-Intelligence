const aiAssistantPrompts = {
    'Proofread': [
        'Proofread this:\n\n',
        'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Rewrite': [
        'Rewrite this:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Friendly Tone': [
        'Make this sound more friendly:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more friendly. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more professional. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
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
            parentId: "ai-assistant-context-menu",
            title: key,
            contexts: ["selection"]
        });
    }

    chrome.contextMenus.create({
        id: "ai-assistant-describe-image",
        parentId: "ai-assistant-context-menu",
        title: "Describe Image",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-describe-pdf",
        parentId: "ai-assistant-context-menu",
        title: "Describe PDF",
        contexts: ["link"],
        documentUrlPatterns: ["*://*.pdf"]
    });
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId === "ai-assistant-describe-image") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getImageDetails,
            args: [data.srcUrl]
        });
    } else if (data.menuItemId === "ai-assistant-describe-pdf") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getPDFDetails,
            args: [data.linkUrl]
        });
    } else {
        let promptKey = data.menuItemId.replace("ai-assistant-", "");
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: useAI,
            args: [data.selectionText, aiAssistantPrompts[promptKey][0], aiAssistantPrompts[promptKey][1]]
        });
    }
});

async function getImageDetails(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        const mimeType = blob.type;
        chrome.runtime.sendMessage({ action: 'processImage', data: { base64Content, mimeType } });
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}

async function getPDFDetails(fileUrl) {
    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: fileUrl, fileType: 'pdf' });
}

function useAI(selectedText, prePrompt, prompt) {
    chrome.runtime.sendMessage({ action: 'showPopup', data: { selectedText, prePrompt, prompt } });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateText') {
        (async () => {
            try {
                const { selectedText, prePrompt, prompt, apiKey } = request.data;
                const settings = await new Promise((resolve) => {
                    chrome.storage.sync.get([
                        'platform',
                        'model',
                        'use_specific_model',
                        'custom_model'
                    ], resolve);
                });
                const { platform, model, use_specific_model, custom_model } = settings;

                let chosenModel = model;
                if (use_specific_model && custom_model) {
                    chosenModel = custom_model;
                }

                let apiHandlers = {
                    'Gemini': {
                        'generateText': async (prompt, apiKey) => {
                            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${apiKey}`;
                            const geminiPayload = {
                                "contents": [{
                                    "parts": [{ "text": prompt + selectedText }]
                                }]
                            };

                            const geminiResponse = await fetch(geminiApiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(geminiPayload)
                            });

                            if (!geminiResponse.ok) {
                                throw new Error(`Gemini API error! Status: ${geminiResponse.status}`);
                            }

                            const geminiData = await geminiResponse.json();

                            if (geminiData.candidates && geminiData.candidates.length > 0) {
                                return geminiData.candidates[0].content.parts[0].text;
                            } else {
                                throw new Error('No candidates found in Gemini API response.');
                            }
                        },
                        'processImage': async (base64Content, mimeType, prompt, apiKey) => {
                            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${apiKey}`;
                            const geminiPayload = {
                                "contents": [{
                                    "parts": [
                                        { "text": prompt },
                                        {
                                            "inline_data": {
                                                "mime_type": mimeType,
                                                "data": base64Content
                                            }
                                        }
                                    ]
                                }]
                            };

                            const geminiResponse = await fetch(geminiApiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(geminiPayload)
                            });

                            if (!geminiResponse.ok) {
                                throw new Error(`Gemini API error! Status: ${geminiResponse.status}`);
                            }

                            const geminiData = await geminiResponse.json();

                            if (geminiData.candidates && geminiData.candidates.length > 0) {
                                return geminiData.candidates[0].content.parts[0].text;
                            } else {
                                throw new Error('No candidates found in Gemini API response.');
                            }
                        }
                    },
                    'Cloudflare Worker AI': {
                        'generateText': async (prompt, apiKey, accountId, model) => {
                            const cfApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

                            const cfPayload = {
                                "messages": [
                                    { "role": "user", "content": prompt + selectedText }
                                ]
                            };

                            const cfResponse = await fetch(cfApiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${apiKey}`
                                },
                                body: JSON.stringify(cfPayload)
                            });

                            if (!cfResponse.ok) {
                                throw new Error(`Cloudflare API error! Status: ${cfResponse.status}`);
                            }

                            const cfData = await cfResponse.json();

                            if (cfData.result && cfData.result.response) {
                                return cfData.result.response;
                            } else {
                                throw new Error('No response found in Cloudflare API response.');
                            }
                        }
                    },
                    'OpenRouter': {
                        'generateText': async (prompt, apiKey) => {
                            const openRouterApiUrl = 'https://api.openrouter.ai/api/v1/chat/completions';

                            const openRouterPayload = {
                                "model": chosenModel,
                                "messages": [{ "role": "user", "content": prompt + selectedText }],
                                "max_tokens": 2048,
                            };

                            const openRouterResponse = await fetch(openRouterApiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${apiKey}`,
                                    'HTTP-Referer': 'https://chromium-intelligence.com',
                                    'X-Title': 'Chromium-Intelligence'
                                },
                                body: JSON.stringify(openRouterPayload)
                            });

                            if (!openRouterResponse.ok) {
                                throw new Error(`OpenRouter API error! Status: ${openRouterResponse.status}`);
                            }

                            const openRouterData = await openRouterResponse.json();

                            if (openRouterData.choices && openRouterData.choices.length > 0) {
                                return openRouterData.choices[0].message.content;
                            } else {
                                throw new Error('No choices found in OpenRouter API response.');
                            }
                        }
                    }
                };

                let response = null;

                if (platform === 'Gemini') {
                    response = await apiHandlers[platform].generateText(prePrompt + selectedText, apiKey);
                } else if (platform === 'Cloudflare Worker AI') {
                    const cloudflareId = await new Promise((resolve) => {
                        chrome.storage.sync.get(['cloudflareId'], (result) => {
                            resolve(result.cloudflareId);
                        });
                    });
                    response = await apiHandlers[platform].generateText(prePrompt, apiKey, cloudflareId, chosenModel);
                } else if (platform === 'OpenRouter') {
                    response = await apiHandlers[platform].generateText(prePrompt, apiKey);
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