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
        'You are a writing assistant. Make the text provided by the user sound more friendly. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Make the text provided by the user sound more professional. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise. Output ONLY the rewritten text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text provided without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Analyze Image': [
        'Describe this image in detail:\n\n',
        'You are an AI model capable of describing images in detail. Analyze the image provided and give a detailed description. Output ONLY the detailed image description without additional comments. Respond in the same language as the input (e.g., English US, French). If the image is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_IMAGE_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (text, prompt, apiKey, model) => {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt + text }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                        },
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                    throw new Error('No valid candidates found in the response.');
                }

                return data.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            try {
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${apiKey}`;

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: prompt
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Content
                                    }
                                }
                            ]
                        }]
                    })
                };

                const response = await fetch(geminiApiUrl, requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                    throw new Error('No valid candidates found in the response.');
                }

                return data.candidates[0].content.parts[0].text;

            } catch (error) {
                console.error("Gemini API call failed:", error);
                throw error;
            }
        }
    },
    cloudflare: {
        processText: async (text, prompt, accountId, apiKey, model) => {
            try {
                const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
                const headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                const body = JSON.stringify({
                    prompt: prompt + text
                });

                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: body
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.result && data.result.response) {
                    return data.result.response;
                } else {
                    throw new Error('Unexpected response format from Cloudflare API.');
                }
            } catch (error) {
                console.error('Error calling Cloudflare API:', error);
                throw error;
            }
        }
    },
    openrouter: {
        processText: async (text, prompt, apiKey, model) => {
            try {
                const response = await fetch("https://api.openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: "user",
                                content: prompt + text
                            }
                        ],
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                    return data.choices[0].message.content;
                } else {
                    throw new Error("Unexpected response format from OpenRouter API.");
                }
            } catch (error) {
                console.error('Error calling OpenRouter API:', error);
                throw error;
            }
        }
    }
};

chrome.contextMenus.create({
    id: "ai-assistant-context-menu",
    title: "AI Assistant: %s",
    contexts: ["selection", "image", "link"]
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "ai-assistant-context-menu") {
        let selectedText = info.selectionText;
        let imgSrcUrl = info.srcUrl;
        let linkUrl = info.linkUrl;

        if (selectedText) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPromptInput,
                args: [selectedText, 'text']
            });
        } else if (imgSrcUrl) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPromptInput,
                args: [imgSrcUrl, 'image']
            });
        } else if (linkUrl) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPromptInput,
                args: [linkUrl, 'link']
            });
        }
    }
});

function showPromptInput(data, type) {
    // Send a message to content.js to show the prompt input
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showPromptInput', fileUrl: data, fileType: type });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, prompt, platform, model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey, use_specific_model } = request.data;
                let responseText = "";
                let usedModel = model;

                if (use_specific_model && custom_model) {
                    usedModel = custom_model;
                }

                switch (platform) {
                    case 'Gemini':
                        responseText = await apiHandlers.gemini.processText(selectedText, prompt, geminiApiKey, usedModel);
                        break;
                    case 'Cloudflare Worker AI':
                        responseText = await apiHandlers.cloudflare.processText(selectedText, prompt, cloudflareId, cloudflareApiKey, usedModel);
                        break;
                    case 'OpenRouter':
                        responseText = await apiHandlers.openrouter.processText(selectedText, prompt, openrouterApiKey, usedModel);
                        break;
                    default:
                        responseText = "ERROR_PLATFORM_NOT_SUPPORTED";
                }

                chrome.scripting.executeScript({
                    target: { tabId: sender.tab.id },
                    function: showPopup,
                    args: [responseText]
                });
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