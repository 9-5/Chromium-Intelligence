const aiAssistantPrompts = {
    'Proofread': [
        'Proofread this:\n\n',
        'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Rewrite': [
        'Rewrite this:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Friendly': [
        'Make this sound more friendly:\n\n',
        'You are a content rewriting assistant. Rewrite the text provided by the user to have a more friendly and casual tone. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this sound more professional:\n\n',
        'You are a content rewriting assistant. Rewrite the text provided by the user to have a more professional and formal tone. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a content rewriting assistant. Rewrite the text provided by the user to be more concise and to-the-point. Remove any unnecessary words or phrases. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate to French': [
        'Translate this to French:\n\n',
        'You are a translation assistant. Translate the text provided by the user to French. Output ONLY the translated text. If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate to German': [
        'Translate this to German:\n\n',
        'You are a translation assistant. Translate the text provided by the user to German. Output ONLY the translated text. If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate to Spanish': [
        'Translate this to Spanish:\n\n',
        'You are a translation assistant. Translate the text provided by the user to Spanish. Output ONLY the translated text. If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Sentiment Analysis': [
        'Perform sentiment analysis on this text:\n\n',
        'You are a sentiment analysis assistant. Analyze the sentiment of the text provided by the user. Output ONLY the sentiment detected (e.g., positive, negative, neutral) without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Keyword Extraction': [
        'Extract keywords from this text:\n\n',
        'You are a keyword extraction assistant. Extract the keywords from the text provided by the user. Output ONLY the keywords, separated by commas, without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Question Answering': [
        'Answer the following question based on the context provided. Question: [user question]. Context:\n\n',
        'You are a question answering assistant. Answer the question based on the context provided by the user. Output ONLY the answer to the question, without additional comments. Respond in the same language as the input (e.g., English US, French). If the context is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (prompt, text, apiKey) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
            const headers = {
                'Content-Type': 'application/json'
            };
            const data = {
                contents: [{
                    parts: [{ text: prompt + text }]
                }],
                generationConfig: {
                    candidateCount: 1,
                    maxOutputTokens: 2048,
                    temperature: 0.7,
                    topP: 0.95
                },
                safetySettings: [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_NONE"
                    }
                ]
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Gemini API error:', errorData);
                    throw new Error(`Gemini API request failed with status ${response.status}: ${errorData.error.message}`);
                }

                const json = await response.json();
                if (json.candidates && json.candidates.length > 0 && json.candidates[0].content.parts && json.candidates[0].content.parts.length > 0) {
                    return json.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Unexpected response format from Gemini API');
                }
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
                    candidateCount: 1,
                    maxOutputTokens: 2048,
                    temperature: 0.4,
                    topP: 0.1
                },
                safetySettings: [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_NONE"
                    }
                ]
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Gemini API error:', errorData);
                    throw new Error(`Gemini API request failed with status ${response.status}: ${errorData.error.message}`);
                }

                const json = await response.json();
                if (json.candidates && json.candidates.length > 0 && json.candidates[0].content.parts && json.candidates[0].content.parts.length > 0) {
                    return json.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Unexpected response format from Gemini API');
                }
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw error;
            }
        }
    },
    openrouter: {
        processText: async (prompt, text, apiKey, model) => {
            const url = 'https://api.openrouter.ai/api/v1/chat/completions';
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://0kb.org',
                'X-Title': 'Chromium-Intelligence'
            };
            const data = {
                model: model,
                messages: [{
                    role: 'user',
                    content: prompt + text
                }],
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.95
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('OpenRouter API error:', errorData);
                    throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorData.error.message}`);
                }

                const json = await response.json();
                if (json.choices && json.choices.length > 0) {
                    return json.choices[0].message.content;
                } else {
                    throw new Error('Unexpected response format from OpenRouter API');
                }
            } catch (error) {
                console.error('Error calling OpenRouter API:', error);
                throw error;
            }
        }
    },
    cloudflare: {
        processText: async (prompt, text, accountId, apiKey, model = "@cf/meta/llama-3-8b-instruct") => {
            const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/workers/ai/run/${model}`;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            const data = {
                messages: [
                    {
                        role: "user",
                        content: prompt + text,
                    },
                ],
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Cloudflare API error:', errorData);
                    throw new Error(`Cloudflare API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
                }

                const json = await response.json();
                if (json.result && json.result.response) {
                    return json.result.response;
                } else {
                    throw new Error('Unexpected response format from Cloudflare API');
                }
            } catch (error) {
                console.error('Error calling Cloudflare API:', error);
                throw error;
            }
        }
    }
};

chrome.contextMenus.create({
    id: 'ai-assistant-text',
    title: 'AI Assistant: %s',
    contexts: ['selection']
});

chrome.contextMenus.create({
    id: 'ai-assistant-image',
    title: 'AI Assistant (Image)',
    contexts: ['image']
});

chrome.contextMenus.create({
    id: 'ai-assistant-link',
    title: 'AI Assistant (PDF Link)',
    contexts: ['link'],
    documentUrlPatterns: ["*://*.pdf"]
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'ai-assistant-text') {
        const selectedText = info.selectionText;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [selectedText, 'text']
        });
    } else if (info.menuItemId === 'ai-assistant-image') {
        const imageUrl = info.srcUrl;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [imageUrl, 'image']
        });
    } else if (info.menuItemId === 'ai-assistant-link') {
        const fileUrl = info.linkUrl;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [fileUrl, 'pdf']
        });
    }
});

async function processText(selectedText, prompt, settings) {
    try {
        let responseText = '';
        if (settings.platform === 'Gemini') {
            responseText = await apiHandlers.gemini.processText(prompt, selectedText, settings.geminiApiKey);
        } else if (settings.platform === 'OpenRouter') {
            responseText = await apiHandlers.openrouter.processText(prompt, selectedText, settings.openrouterApiKey, settings.model);
        } else if (settings.platform === 'Cloudflare Worker AI') {
            responseText = await apiHandlers.cloudflare.processText(prompt, selectedText, settings.cloudflareId, settings.cloudflareApiKey);
        } else {
            throw new Error(`Unsupported platform: ${settings.platform}`);
        }

        if (responseText === "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST") {
            throw new Error("The selected text is incompatible with the request. Please try again with different text or a different type of request.");
        }
        return responseText;
    } catch (error) {
        console.error("Error processing text:", error);
        throw error;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, aiPrompt, settings } = request.data;
                const [prompt, systemPrompt] = aiAssistantPrompts[aiPrompt];
                const fullPrompt = systemPrompt + '\n\n' + prompt;

                const responseText = await processText(selectedText, fullPrompt, settings);
                sendResponse({ data: responseText });
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