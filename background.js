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
        'Make this sound more friendly:\n\n',
        'You are a writing assistant. You will make the text provided more friendly. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. You will make the text provided more professional. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. You will rewrite the text to be more concise. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. You will create a summary of the text provided. Output ONLY the summary text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.contextMenus.create({
    id: "ai-assistant-text",
    title: "AI Assistant: %s",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    id: "ai-assistant-image",
    title: "AI Assistant: Analyze Image",
    contexts: ["image"]
});

chrome.contextMenus.create({
    id: "ai-assistant-pdf",
    title: "AI Assistant: Process PDF",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.pdf"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ai-assistant-text") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSettings
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError);
                return;
            }
            const settings = results[0].result;
            const selectedText = info.selectionText;
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPromptInput,
                args: [selectedText, 'text']
            });
        });
    } else if (info.menuItemId === "ai-assistant-image") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSettings
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError);
                return;
            }
            const settings = results[0].result;
            const imageUrl = info.srcUrl;
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: fetchImageAndShowPrompt,
                args: [imageUrl]
            });
        });
    } else if (info.menuItemId === "ai-assistant-pdf") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSettings
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError);
                return;
            }
            const settings = results[0].result;
            const fileUrl = info.linkUrl;
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPromptInput,
                args: [fileUrl, 'pdf']
            });
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'performAiAction') {
        (async () => {
            try {
                const { selectedText, prompt, apiKey, platform, model, useSpecificModel, customModel } = request.data;
                let apiHandler;
                if (platform === 'Gemini') {
                    apiHandler = apiHandlers.gemini;
                } else if (platform === 'Cloudflare Worker AI') {
                    apiHandler = apiHandlers.cloudflare;
                }
                else if (platform === 'OpenRouter') {
                    apiHandler = apiHandlers.openrouter;
                } else {
                    sendResponse({ error: 'Invalid platform specified.' });
                    return;
                }

                const [systemPrompt, userPrompt] = aiAssistantPrompts[prompt];
                const response = await apiHandler.processText(
                    selectedText,
                    systemPrompt,
                    userPrompt,
                    apiKey,
                    model,
                    useSpecificModel,
                    customModel
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