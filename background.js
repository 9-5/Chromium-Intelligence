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
        'Make this sound friendly:\n\n',
        'You are a writing assistant. Convert the text provided by the user to use a more friendly tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound professional:\n\n',
        'You are a writing assistant. Convert the text provided by the user to use a more professional tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise and to the point. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Custom Prompt': [
        '',
        'You are an AI assistant. Respond to the user in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (text, prompt, apiKey) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
            const headers = {
                'Content-Type': 'application/json'
            };
            const data = {
                contents: [{
                    parts: [{
                        text: prompt + text
                    }]
                }],
                generationConfig: {
                    temperature: 0.7
                }
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                if (!responseData.candidates || responseData.candidates.length === 0 || !responseData.candidates[0].content || !responseData.candidates[0].content.parts || responseData.candidates[0].content.parts.length === 0) {
                    throw new Error('Invalid response format from Gemini API.');
                }

                return responseData.candidates[0].content.parts[0].text;

            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
            const headers = {
                'Content-Type': 'application/json'
            };

            const data = {
                contents: [{
                    parts: [{
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Content
                        },
                    }, {
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.4
                }
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                if (!responseData.candidates || responseData.candidates.length === 0 || !responseData.candidates[0].content || !responseData.candidates[0].content.parts || responseData.candidates[0].content.parts.length === 0) {
                    throw new Error('Invalid response format from Gemini API.');
                }

                return responseData.candidates[0].content.parts[0].text;

            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw error;
            }
        }
    },
    cloudflare: {
        processText: async (text, prompt, accountId, apiKey, model = '@cf/meta/llama-2-7b-chat-int8') => {
            const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };

            const data = {
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: text }
                ]
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                if (!responseData.result || !responseData.result.response) {
                    throw new Error('Invalid response format from Cloudflare AI Workers API.');
                }

                return responseData.result.response;

            } catch (error) {
                console.error('Error calling Cloudflare AI Workers API:', error);
                throw error;
            }
        }
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, promptType, customPrompt, platform, model, apiKey, cloudflareId, cloudflareApiKey } = request.data;
                let prompt = customPrompt || aiAssistantPrompts[promptType][0] + aiAssistantPrompts[promptType][1];
                let response;

                if (platform === 'Gemini') {
                    response = await apiHandlers.gemini.processText(selectedText, prompt, apiKey);
                } else if (platform === 'Cloudflare Worker AI') {
                    response = await apiHandlers.cloudflare.processText(selectedText, prompt, cloudflareId, cloudflareApiKey, model);
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