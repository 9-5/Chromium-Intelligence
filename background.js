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
        'You are a writing assistant. Make the text provided by the user sound more friendly and inviting. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Make the text provided by the user sound more professional and formal. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this more concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise and to-the-point. Output ONLY the rewritten text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant-context-menu",
        title: "AI Assistant: %s",
        contexts: ["selection", "image", "link"],
    });
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    let selectedText = data.selectionText;
    let imgSrcUrl = data.srcUrl;
    let linkUrl = data.linkUrl;
    
    (async () => {
        let settings = await new Promise((resolve) => {
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

        if (selectedText) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPromptInput,
                args: [selectedText, 'text']
            });
        } else if (imgSrcUrl) {
            try {
                const imageUrl = new URL(imgSrcUrl);
                const isPdf = imageUrl.pathname.toLowerCase().endsWith('.pdf');

                if (isPdf) {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: showPromptInput,
                        args: [imgSrcUrl, 'pdf']
                    });
                } else {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: showPromptInput,
                        args: [imgSrcUrl, 'image']
                    });
                }
            } catch (error) {
                console.error("Invalid URL:", imgSrcUrl, error);
                return;
            }
        } else if (linkUrl) {
            try {
                const linkURL = new URL(linkUrl);
                const isPdf = linkURL.pathname.toLowerCase().endsWith('.pdf');

                if (isPdf) {
                     chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: showPromptInput,
                        args: [linkUrl, 'pdf']
                    });
                } else {
                     chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: showPromptInput,
                        args: [linkUrl, 'link']
                    });
                }
            } catch (error) {
                console.error("Invalid URL:", linkUrl, error);
                return;
            }
        }
    })();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { text, promptKey, apiKey, platform, model, useSpecificModel, customModel } = request.data;
                const [instruction, aiModelPrompt] = aiAssistantPrompts[promptKey];
                const fullPrompt = instruction + text;

                let response;
                if (platform === 'Gemini') {
                    response = await apiHandlers.gemini.processText(fullPrompt, apiKey);
                } else if (platform === 'Cloudflare Worker AI') {
                    response = await apiHandlers.cloudflare.processText(fullPrompt, apiKey, model, useSpecificModel, customModel);
                } else if (platform === 'OpenRouter') {
                    response = await apiHandlers.openrouter.processText(fullPrompt, apiKey, model, useSpecificModel, customModel);
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