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
        'Make this more friendly:\n\n',
        'You are a writing assistant. Convert the text provided by the user into a more friendly and casual tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this more professional:\n\n',
        'You are a writing assistant. Convert the text provided by the user into a more professional tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise and to-the-point. Remove any unnecessary words or phrases. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Caption Image': [
        'Describe this image. Provide a caption. Be as descriptive as possible.\n\n',
        'You are a image captioning assistant. Describe the image provided by the user and generate a caption. Output ONLY the caption text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the image is absolutely incompatible with this (e.g., totally random noise), output "ERROR_IMAGE_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.contextMenus.create({
    id: "ai-assistant",
    title: "AI Assistant",
    contexts: ["selection", "image", "link"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-proofread",
    title: "Proofread",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-rewrite",
    title: "Rewrite",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-make-friendly",
    title: "Make Friendly",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-make-professional",
    title: "Make Professional",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-make-concise",
    title: "Make Concise",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-summarize",
    title: "Summarize",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    parentId: "ai-assistant",
    id: "ai-caption-image",
    title: "Caption Image",
    contexts: ["image"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    let action = '';
    let selectedText = '';
    let imageUrl = '';

    if (info.menuItemId === "ai-proofread") {
        action = 'Proofread';
        selectedText = info.selectionText;
    } else if (info.menuItemId === "ai-rewrite") {
        action = 'Rewrite';
        selectedText = info.selectionText;
    } else if (info.menuItemId === "ai-make-friendly") {
        action = 'Make Friendly';
        selectedText = info.selectionText;
    } else if (info.menuItemId === "ai-make-professional") {
        action = 'Make Professional';
        selectedText = info.selectionText;
    } else if (info.menuItemId === "ai-make-concise") {
        action = 'Make Concise';
        selectedText = info.selectionText;
    } else if (info.menuItemId === "ai-summarize") {
        action = 'Summarize';
        selectedText = info.selectionText;
    } else if (info.menuItemId === "ai-caption-image") {
        action = 'Caption Image';
        imageUrl = info.srcUrl;
    }

    if (action && selectedText) {
        chrome.storage.sync.get(['platform', 'geminiApiKey', 'openrouterApiKey', 'cloudflareId', 'cloudflareApiKey'], function(data) {
            let apiKey = '';
            if (data.platform === 'Gemini') {
                apiKey = data.geminiApiKey;
            } else if (data.platform === 'OpenRouter') {
                apiKey = data.openrouterApiKey;
            } else if (data.platform === 'Cloudflare Worker AI') {
                apiKey = data.cloudflareApiKey;
            }
            
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: callAPI,
                args: [action, selectedText, apiKey, data.platform, data.cloudflareId]
            });
        });
    } else if (action && imageUrl) {
        chrome.storage.sync.get(['platform', 'geminiApiKey', 'openrouterApiKey', 'cloudflareId', 'cloudflareApiKey'], function(data) {
            let apiKey = '';
            if (data.platform === 'Gemini') {
                apiKey = data.geminiApiKey;
            } else if (data.platform === 'OpenRouter') {
                apiKey = data.openrouterApiKey;
            } else if (data.platform === 'Cloudflare Worker AI') {
                apiKey = data.cloudflareApiKey;
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: getImageAndCallAPI,
                args: [action, imageUrl, apiKey, data.platform, data.cloudflareId]
            });
        });
    }
});

function callAPI(action, selectedText, apiKey, platform, cloudflareAccountId) {
    const prompt = aiAssistantPrompts[action][0] + selectedText;
    const context = aiAssistantPrompts[action][1];

    (async () => {
        let responseContent = '';
        try {
            if (platform === 'Gemini') {
                const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "contents": [{
                            "parts": [{ "text": prompt + '\n' + context }]
                        }],
                        "generationConfig": {
                            "temperature": 0.7,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 8192
                        },
                        "safetySettings": [{
                            "category": "HARM_CATEGORY_HARASSMENT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        }, {
                            "category": "HARM_CATEGORY_HATE_SPEECH",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        }, {
                            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        }, {
                            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                        }]
                    })
                });

                if (!geminiResponse.ok) {
                    throw new Error(`HTTP error! status: ${geminiResponse.status}`);
                }
                const geminiData = await geminiResponse.json();
                responseContent = geminiData.candidates[0].content.parts[0].text;

            } else if (platform === 'OpenRouter') {
                const openrouterResponse = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey,
                    },
                    body: JSON.stringify({
                        "model": "google/gemini-1.5-pro-latest",
                        "messages": [{ "role": "user", "content": prompt + '\n' + context }],
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "max_tokens": 8192
                    })
                });

                if (!openrouterResponse.ok) {
                    throw new Error(`HTTP error! status: ${openrouterResponse.status}`);
                }

                const openrouterData = await openrouterResponse.json();
                responseContent = openrouterData.choices[0].message.content;

            } else if (platform === 'Cloudflare Worker AI') {
                const cloudflareResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/@cf/meta/llama-3-8b-instruct`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey,
                    },
                    body: JSON.stringify({
                        "messages": [{ "role": "user", "content": prompt + '\n' + context }],
                    })
                });

                if (!cloudflareResponse.ok) {
                    throw new Error(`HTTP error! status: ${cloudflareResponse.status}`);
                }

                const cloudflareData = await cloudflareResponse.json();
                responseContent = cloudflareData.result.response;
            }

            chrome.runtime.sendMessage({ action: 'showPopup', data: responseContent });

        } catch (error) {
            console.error('Error calling API:', error);
            chrome.runtime.sendMessage({ action: 'showPopup', data: `ERROR: ${error.message}` });
        }
    })();
}

function getImageAndCallAPI(action, imageUrl, apiKey, platform, cloudflareAccountId) {
    (async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const base64Content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
			
			const mimeType = blob.type; // Get the MIME type of the image
			
            const prompt = aiAssistantPrompts[action][0];
            const context = aiAssistantPrompts[action][1];
			
			let responseContent = '';

            if (platform === 'Gemini') {
				const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"contents": [{
							"parts": [
								{ "text": prompt + '\n' + context },
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
							"topK": 40,
							"topP": 0.95,
							"maxOutputTokens": 8192
						},
						"safetySettings": [{
							"category": "HARM_CATEGORY_HARASSMENT",
							"threshold": "BLOCK_MEDIUM_AND_ABOVE"
						}, {
							"category": "HARM_CATEGORY_HATE_SPEECH",
							"threshold": "BLOCK_MEDIUM_AND_ABOVE"
						}, {
							"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
							"threshold": "BLOCK_MEDIUM_AND_ABOVE"
						}, {
							"category": "HARM_CATEGORY_DANGEROUS_CONTENT",
							"threshold": "BLOCK_MEDIUM_AND_ABOVE"
						}]
					})
				});

				if (!geminiResponse.ok) {
					throw new Error(`HTTP error! status: ${geminiResponse.status}`);
				}
				const geminiData = await geminiResponse.json();
				responseContent = geminiData.candidates[0].content.parts[0].text;
			}

            chrome.runtime.sendMessage({ action: 'showPopup', data: responseContent });

        } catch (error) {
            console.error('Error processing image:', error);
            chrome.runtime.sendMessage({ action: 'showPopup', data: `ERROR: ${error.message}` });
        }
    })();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getSettings') {
        (async () => {
            try {
                chrome.storage.sync.get(null, (items) => {
                    sendResponse({ data: items });
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