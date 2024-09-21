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
        'Make this sound friendly:\n\n',
        'You are a writing assistant. Convert the text provided by the user to a friendly tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound professional:\n\n',
        'You are a writing assistant. Convert the text provided by the user to a professional tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user concisely. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate': [
        'Translate this to ',
        '.\n\n',
        'You are a translation assistant. Translate the text provided by the user into the specified language. Output ONLY the translated text without additional comments. If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Sentiment Analysis': [
        'Analyze the sentiment of this:\n\n',
        'You are a sentiment analysis assistant. Analyze the sentiment of the text provided by the user. Output ONLY the sentiment (e.g., positive, negative, neutral) without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Keyword Extraction': [
        'Extract keywords from this:\n\n',
        'You are a keyword extraction assistant. Extract the keywords from the text provided by the user. Output ONLY the keywords, separated by commas, without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Question Answering': [
        'Answer this question based on the provided context:\n\n',
        'You are a question answering assistant. Answer the question provided by the user based on the provided context. Output ONLY the answer without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Custom Prompt': [
        '',
        'You are an AI assistant. Respond to the user based on their prompt. Output ONLY the response to the prompt without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Image Analysis': [
        'Describe this image in detail:\n\n',
        'You are an image analysis assistant. Describe the image provided by the user in detail. Output ONLY the description of the image without additional comments. Respond in the same language as the input (e.g., English US, French). If the image cannot be analyzed, output "ERROR_IMAGE_CANNOT_BE_ANALYZED".'
    ]
};

const apiHandlers = {
    gemini: {
        processText: async (prompt, apiKey) => {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
                const headers = {
                    'Content-Type': 'application/json'
                };
                const data = {
                    "contents": [{
                        "parts": [{ "text": prompt }]
                    }]
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Gemini API error:', errorData);
                    throw new Error(`Gemini API Error: ${response.status} - ${response.statusText}`);
                }

                const responseData = await response.json();
                console.log("Gemini API Response:", responseData);

                if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0) {
                    return responseData.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Unexpected response format from Gemini API');
                }

            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw error;
            }
        },
        processImage: async (base64Content, mimeType, prompt, apiKey) => {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
                const headers = {
                    'Content-Type': 'application/json'
                };

                const data = {
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

                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Gemini API error:', errorData);
                    throw new Error(`Gemini API Error: ${response.status} - ${response.statusText}`);
                }

                const responseData = await response.json();
                console.log("Gemini API Response:", responseData);

                if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0) {
                    return responseData.candidates[0].content.parts[0].text;
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
        processText: async (prompt, apiKey, model) => {
            try {
                const url = 'https://api.openrouter.ai/api/v1/chat/completions';
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://0kb.org',
                    'X-Title': 'Chromium-Intelligence'
                };
                const data = {
                    "model": model,
                    "messages": [{ "role": "user", "content": prompt }],
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('OpenRouter API error:', errorData);
                    throw new Error(`OpenRouter API Error: ${response.status} - ${response.statusText}`);
                }

                const responseData = await response.json();
                console.log("OpenRouter API Response:", responseData);

                if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
                    return responseData.choices[0].message.content;
                } else {
                    throw new Error('Unexpected response format from OpenRouter API');
                }

            } catch (error) {
                console.error('Error calling OpenRouter API:', error);
                throw error;
            }
        }
    }
};

chrome.contextMenus.create({
    id: "ai-assistant-image",
    title: "Analyze Image with AI",
    contexts: ["image"]
});

chrome.contextMenus.create({
    id: "ai-assistant-pdf",
    title: "Process PDF with AI",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.pdf", "*://*.pdf?*"]
});

chrome.contextMenus.create({
    id: "ai-assistant-text",
    title: "AI Assistant: %s",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log("Context menu item clicked:", info);

    if (info.menuItemId === "ai-assistant-image") {
        const imageUrl = info.srcUrl;
        try {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: getImageData,
                args: [imageUrl]
            }, async (results) => {
                if (chrome.runtime.lastError) {
                    console.error("Error executing script:", chrome.runtime.lastError.message);
                    return;
                }

                const { base64Content, mimeType } = results[0].result;
                const { platform, geminiApiKey } = await getSettings();
                if (platform === 'Gemini') {
                    const prompt = aiAssistantPrompts['Image Analysis'][0] + aiAssistantPrompts['Image Analysis'][1];

                    chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: 'Loading...' });
                    try {
                        const response = await apiHandlers.gemini.processImage(base64Content, mimeType, prompt, geminiApiKey);
                        chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: response });
                    } catch (error) {
                        console.error('Error processing image:', error);
                        chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
                    }
                } else {
                    chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: 'Image analysis is only supported on Gemini.' });
                }
            });
        } catch (error) {
            console.error("Error:", error);
            chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
        }

        async function getImageData(imageUrl) {
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const mimeType = blob.type;

                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64Content = reader.result.split(',')[1];
                        resolve({ base64Content, mimeType });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                throw new Error(`Failed to fetch image: ${error.message}`);
            }
        }
        return;
    }

    if (info.menuItemId === "ai-assistant-pdf") {
        const fileUrl = info.linkUrl;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [fileUrl, 'pdf']
        });

        function showPromptInput(fileUrl, fileType) {
            chrome.runtime.sendMessage({
                action: 'showPromptInput',
                fileUrl: fileUrl,
                fileType: fileType
            });
        }
        return;
    }

    if (info.menuItemId === "ai-assistant-text") {
        const selectedText = info.selectionText;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSettings
        }, async (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error executing script:", chrome.runtime.lastError.message);
                return;
            }

            const settings = results[0].result;
            const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey } = settings;

            let aiActions = {
                'Proofread': () => processText('Proofread', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Rewrite': () => processText('Rewrite', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Friendly Tone': () => processText('Friendly Tone', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Professional Tone': () => processText('Professional Tone', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Concise Rewrite': () => processText('Concise Rewrite', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Summarize': () => processText('Summarize', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Translate': () => {
                    const language = prompt("Enter the target language:");
                    if (language) {
                        processText('Translate', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, language);
                    }
                },
                'Sentiment Analysis': () => processText('Sentiment Analysis', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Keyword Extraction': () => processText('Keyword Extraction', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey),
                'Custom Prompt': () => {
                    const customPrompt = prompt("Enter your custom prompt:");
                    if (customPrompt) {
                        processText('Custom Prompt', selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, customPrompt);
                    }
                }
            };

            let choice = await new Promise((resolve) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: askUserForAction,
                    args: [Object.keys(aiActions)]
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error executing script:", chrome.runtime.lastError.message);
                        resolve(null);
                        return;
                    }
                    resolve(results[0].result);
                });

                function askUserForAction(actions) {
                    return new Promise((resolve) => {
                        let choice = prompt("Choose an action:\n" + actions.join('\n'));
                        resolve(choice);
                    });
                }
            });

            if (choice && aiActions[choice]) {
                aiActions[choice]();
            } else {
                console.log("Invalid choice or no action selected.");
            }
        });

        async function processText(actionType, selectedText, platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, extraInput = null) {
            let fullPrompt;
            if (actionType === 'Translate') {
                fullPrompt = aiAssistantPrompts[actionType][0] + extraInput + aiAssistantPrompts[actionType][1] + selectedText;
            } else if (actionType === 'Custom Prompt') {
                fullPrompt = extraInput + '\n\n' + selectedText;
            }
            else {
                fullPrompt = aiAssistantPrompts[actionType][0] + selectedText + aiAssistantPrompts[actionType][1];
            }

            chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: 'Loading...' });

            try {
                let responseText;
                if (platform === 'Gemini') {
                    responseText = await apiHandlers.gemini.processText(fullPrompt, geminiApiKey);
                } else if (platform === 'OpenRouter') {
                    const finalModel = use_specific_model ? custom_model : model;
                    responseText = await apiHandlers.openrouter.processText(fullPrompt, openrouterApiKey, finalModel);
                } else {
                    throw new Error('Platform not supported.');
                }

                chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: responseText });

            } catch (error) {
                console.error('Error processing text:', error);
                chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error.message}` });
            }
        }

        async function getSettings() {
            return new Promise((resolve) => {
                chrome.storage.sync.get([
                    'platform',
                    'model',
                    'use_specific_model',
                    'custom_model',
                    'geminiApiKey',
                    'openrouterApiKey'
                ], resolve);
            });
        }
        return;
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'processPdf') {
        (async () => {
            try {
                const { fileUrl, prompt, apiKey, platform, model, use_specific_model, custom_model } = request.data;

                // Fetch the PDF
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();

                // Convert PDF to text
                const pdfData = new Uint8Array(await blob.arrayBuffer());
                const pdf = await pdfjsLib.getDocument(pdfData).promise;
                let pdfText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    pdfText += pageText + '\n';
                }

                // Construct the full prompt
                const fullPrompt = aiAssistantPrompts['Question Answering'][0] + prompt + '\n\nContext:\n' + pdfText + aiAssistantPrompts['Question Answering'][1];

                let aiResponse;
                if (platform === 'Gemini') {
                    // Call the Gemini API
                    aiResponse = await apiHandlers.gemini.processText(fullPrompt, apiKey);
                } else if (platform === 'OpenRouter') {
                    const finalModel = use_specific_model ? custom_model : model;
                    aiResponse = await apiHandlers.openrouter.processText(fullPrompt, apiKey, finalModel);
                } else {
                    sendResponse({ error: 'Platform not supported' });
                    return;
                }

                sendResponse({ data: aiResponse });

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