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
        'Make this sound more friendly and casual:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more friendly and casual. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more professional. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it more concise. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Extract Entities': [
        'Extract the entities from this text:\n\n',
        'You are an entity extraction assistant. Extract the entities from the text provided by the user. Output ONLY the extracted entities as a JSON object with keys for PERSON, ORG, GPE, DATE, TIME, MONEY, and MISC. If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

const contextMenuItem = {
    "id": "chromium-intelligence",
    "title": "Chromium Intelligence",
    "contexts": ["selection", "image", "link"]
};

chrome.contextMenus.create(contextMenuItem);

chrome.contextMenus.onClicked.addListener(function (clickData) {
    if (clickData.menuItemId == "chromium-intelligence" && clickData.selectionText) {
        chrome.scripting.executeScript({
            target: { tabId: clickData.tabId },
            function: showPromptInput,
            args: [clickData.selectionText, 'text']
        });
    }
    if (clickData.menuItemId == "chromium-intelligence" && clickData.mediaType === "image" && clickData.srcUrl) {
        chrome.scripting.executeScript({
            target: { tabId: clickData.tabId },
            function: showPromptInput,
            args: [clickData.srcUrl, 'image']
        });
    }
});

async function fetchData(prompt, apiKey) {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": prompt }]
                }],
                "generationConfig": {
                    "temperature": 0.9,
                    "topP": 1,
                    "topK": 1,
                    "maxOutputTokens": 8192
                },
                "safetySettings": [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

const apiHandlers = {
    gemini: {
        processText: async (text, prompt, apiKey) => {
            try {
                const fullPrompt = prompt + text;
                const data = await fetchData(fullPrompt, apiKey);
                return data;
            } catch (error) {
                console.error("Error in Gemini text processing:", error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            try {
                 const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent?key=' + apiKey, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "contents": [{
                            "parts": [
                                {
                                    "text": prompt
                                },
                                {
                                    "inline_data": {
                                        "mime_type": mimeType,
                                        "data": base64Content
                                    }
                                }
                            ]
                        }],
                        "generationConfig": {
                            "temperature": 0.4,
                            "topP": 1,
                            "topK": 32,
                            "maxOutputTokens": 4096
                        },
                        "safetySettings": [
                            {
                                "category": "HARM_CATEGORY_HARASSMENT",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            },
                            {
                                "category": "HARM_CATEGORY_HATE_SPEECH",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            },
                            {
                                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            },
                            {
                                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            }
                        ]
                    })
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data.candidates[0].content.parts[0].text;

            } catch (error) {
                console.error("Error in Gemini image processing:", error);
                throw error;
            }
        }
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { text, prompt, apiKey } = request.data;
                const response = await apiHandlers.gemini.processText(
                    text,
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