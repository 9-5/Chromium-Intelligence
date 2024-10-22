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
        'You are a writing assistant. Rewrite the text provided by the user to sound more friendly and approachable. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to sound more professional and polished. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this to be more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise and to the point. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user to its key points. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate': [
        'Translate this to [TARGET LANGUAGE]:\n\n',
        'You are a translation assistant. Translate the text provided by the user to the specified target language. Output ONLY the translated text without additional comments. If the translation cannot be completed or the language is not supported, output "ERROR_TRANSLATION_FAILED".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (prompt, apiKey) => {
            const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey;
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            };

            try {
                const response = await fetch(geminiApiUrl, requestOptions);
                const data = await response.json();
                if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Failed to extract text from Gemini API response');
                }
            } catch (error) {
                console.error('Gemini API Error:', error);
                throw new Error(`Gemini API request failed: ${error.message}`);
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey;
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Content
                                }
                            },
                            {
                                text: prompt
                            }
                        ]
                    }]
                })
            };

            try {
                const response = await fetch(geminiApiUrl, requestOptions);
                const data = await response.json();
                if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Failed to extract text from Gemini API response');
                }
            } catch (error) {
                console.error('Gemini API Error:', error);
                throw new Error(`Gemini API request failed: ${error.message}`);
            }
        }
    },
    cloudflare: {
        processText: async (prompt, model, accountId, apiToken) => {
            const cloudflareApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            };

            try {
                const response = await fetch(cloudflareApiUrl, requestOptions);
                const data = await response.json();
                if (data && data.result && data.result.response) {
                    return data.result.response;
                } else {
                    throw new Error('Failed to extract text from Cloudflare API response');
                }
            } catch (error) {
                console.error('Cloudflare API Error:', error);
                throw new Error(`Cloudflare API request failed: ${error.message}`);
            }
        }
    },
   openrouter: {
        processText: async (prompt, model, apiKey) => {
            const openrouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{
                        role: "user",
                        content: prompt
                    }]
                })
            };

            try {
                const response = await fetch(openrouterApiUrl, requestOptions);
                const data = await response.json();
                if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    return data.choices[0].message.content;
                } else {
                    throw new Error('Failed to extract text from OpenRouter API response');
                }
            } catch (error) {
                console.error('OpenRouter API Error:', error);
                throw new Error(`OpenRouter API request failed: ${error.message}`);
            }
        }
    }
};

chrome.contextMenus.create({
    id: 'ai-assistant',
    title: 'AI Assistant',
    contexts: ['selection', 'image', 'link']
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'ai-assistant') {
        let selectedText = info.selectionText;
        let srcUrl = info.srcUrl;
        let linkUrl = info.linkUrl;

        const settings = await new Promise(resolve => {
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

        const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = settings;

        if (selectedText) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    const prompt = prompt("Enter your prompt:", "Proofread this");
                    return prompt;
                }
            }, async (results) => {
                if (results && results[0] && results[0].result) {
                    const userPrompt = results[0].result;
                     try {
                        let responseText = '';
                        if (platform === 'Gemini') {
                            responseText = await apiHandlers.gemini.processText(userPrompt + '\n\n' + selectedText, geminiApiKey);
                        } else if (platform === 'Cloudflare Worker AI') {
                            responseText = await apiHandlers.cloudflare.processText(userPrompt + '\n\n' + selectedText, model, cloudflareId, cloudflareApiKey);
                        } else if (platform === 'OpenRouter') {
                            responseText = await apiHandlers.openrouter.processText(userPrompt + '\n\n' + selectedText, model, openrouterApiKey);
                        }

                        chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: responseText });
                    } catch (error) {
                        chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
                    }
                }
            });
        } else if (srcUrl) {
            try {
                const imageUrl = srcUrl;
                const fetchedData = await fetch(imageUrl);
                const blob = await fetchedData.blob();
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const prompt = prompt("Enter your prompt for the image:", "Describe this image");
                        return prompt;
                    }
                }, async (results) => {
                    if (results && results[0] && results[0].result) {
                        const userPrompt = results[0].result;
                         try {
                            let responseText = '';
                            if (platform === 'Gemini') {
                                responseText = await apiHandlers.gemini.processImage(base64Data, blob.type, userPrompt, geminiApiKey);
                            } else {
                                responseText = "Image analysis is only supported on Gemini platform currently."
                            }
                            chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: responseText });
                        } catch (error) {
                            chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
                        }
                    }
                });

            } catch (error) {
                console.error("Error fetching image:", error);
                chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
            }
        } else if (linkUrl) {
            try {
                const pdfUrl = linkUrl;
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: (pdfUrl) => {
                        chrome.runtime.sendMessage({action: 'showPromptInput', fileUrl: pdfUrl, fileType: 'pdf'});
                    },
                    args: [pdfUrl]
                });
            } catch (error) {
                console.error("Error processing PDF link:", error);
                chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
            }
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { prompt, selectedText, platform, model, apiKey } = request.data;
                let response;

                if (platform === 'Gemini') {
                    response = await apiHandlers.gemini.processText(prompt + '\n\n' + selectedText, apiKey);
                } else if (platform === 'Cloudflare Worker AI') {
                    const { accountId, apiToken } = request.data;
                    response = await apiHandlers.cloudflare.processText(prompt + '\n\n' + selectedText, model, accountId, apiToken);
                } else if (platform === 'OpenRouter') {
                    response = await apiHandlers.openrouter.processText(prompt + '\n\n' + selectedText, model, apiKey);
                } else {
                    sendResponse({ error: 'Platform not supported.' });
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