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
        'Rewrite this in a friendly tone:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more friendly and approachable. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Rewrite this in a professional tone:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more professional and formal. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise and to-the-point, removing unnecessary words. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (text, apiKey) => {
            try {
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
                const response = await fetch(geminiApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: text }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error.message);
                }
                
                if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                    throw new Error('No candidates found in Gemini response.');
                }
                
                return data.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error("Gemini API error:", error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            try {
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${apiKey}`;
                const response = await fetch(geminiApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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

                if (data.error) {
                    throw new Error(data.error.message);
                }
                
                if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                    throw new Error('No candidates found in Gemini response.');
                }
                
                return data.candidates[0].content.parts[0].text;
                
            } catch (error) {
                console.error("Gemini API error:", error);
                throw error;
            }
        }
    },
    cloudflare: {
        processText: async (text, accountId, apiKey, model = "@cf/meta/llama-2-7b-chat-int8") => {
            const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
            try {
                const response = await fetch(cloudflareUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: "user",
                                content: text
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.errors && data.errors.length > 0) {
                    throw new Error(data.errors[0].message);
                }

                return data.result.response;
            } catch (error) {
                console.error("Cloudflare API error:", error);
                throw error;
            }
        }
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'ai-assistant',
        title: 'AI Assistant',
        contexts: ['selection', 'image', 'link']
    });

    for (const action in aiAssistantPrompts) {
        chrome.contextMenus.create({
            id: `ai-assistant-${action}`,
            title: action,
            parentId: 'ai-assistant',
            contexts: ['selection']
        });
    }

    chrome.contextMenus.create({
        id: 'ai-assistant-image',
        title: 'Describe This Image',
        parentId: 'ai-assistant',
        contexts: ['image']
    });

    chrome.contextMenus.create({
        id: 'ai-assistant-pdf',
        title: 'Analyze PDF',
        parentId: 'ai-assistant',
        contexts: ['link'],
        documentUrlPatterns: ["*://*/*.pdf"]
    });
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId.startsWith('ai-assistant-')) {
        const action = data.menuItemId.split('ai-assistant-')[1];
         chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getTextSelection,
            args: [action]
        });
    } else if (data.menuItemId === 'ai-assistant-image') {
         chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getImageDetails,
        });
    } else if (data.menuItemId === 'ai-assistant-pdf') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getPdfDetails,
            args: [data.linkUrl]
        });
    }
});

function getTextSelection(aiAction) {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
        chrome.runtime.sendMessage({
            action: 'getTextSelection',
            data: {
                selectedText: selectedText,
                aiAction: aiAction
            }
        });
    }
}

function getImageDetails() {
    const imageUrl = document.querySelector('img:hover').src;
    chrome.runtime.sendMessage({ action: 'processImageFromUrl', data: { imageUrl } });
}

function getPdfDetails(fileUrl) {
    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: fileUrl, fileType: 'pdf' });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, aiAction, apiKey } = request.data;
                const [promptPrefix, promptInstructions] = aiAssistantPrompts[aiAction];
                const fullPrompt = promptPrefix + selectedText + '\n\n' + promptInstructions;
                const response = await apiHandlers.gemini.processText(fullPrompt, apiKey);
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