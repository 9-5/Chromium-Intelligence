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
        'Make this sound more friendly:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to make it sound more friendly and approachable. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to make it sound more professional and formal. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Make this more concise:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to make it more concise and to-the-point. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a text summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant-context-menu",
        title: "AI Assistant",
        contexts: ["selection", "image", "link"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-proofread",
        parentId: "ai-assistant-context-menu",
        title: "Proofread",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-rewrite",
        parentId: "ai-assistant-context-menu",
        title: "Rewrite",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-friendly-tone",
        parentId: "ai-assistant-context-menu",
        title: "Friendly Tone",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-professional-tone",
        parentId: "ai-assistant-context-menu",
        title: "Professional Tone",
        contexts: ["selection"]
    });

     chrome.contextMenus.create({
        id: "ai-assistant-concise-rewrite",
        parentId: "ai-assistant-context-menu",
        title: "Concise Rewrite",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-summarize",
        parentId: "ai-assistant-context-menu",
        title: "Summarize",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-image-analysis",
        parentId: "ai-assistant-context-menu",
        title: "Analyze Image",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-pdf-analysis",
        parentId: "ai-assistant-context-menu",
        title: "Analyze PDF",
        contexts: ["link"],
        documentUrlPatterns: ["*://*.pdf"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    let promptType = null;
    if (info.menuItemId === "ai-assistant-proofread") {
        promptType = 'Proofread';
    } else if (info.menuItemId === "ai-assistant-rewrite") {
        promptType = 'Rewrite';
    } else if (info.menuItemId === "ai-assistant-friendly-tone") {
        promptType = 'Friendly Tone';
    } else if (info.menuItemId === "ai-assistant-professional-tone") {
        promptType = 'Professional Tone';
    } else if (info.menuItemId === "ai-assistant-concise-rewrite") {
        promptType = 'Concise Rewrite';
    } else if (info.menuItemId === "ai-assistant-summarize") {
        promptType = 'Summarize';
    }

    if (promptType) {
        const selectedText = info.selectionText;
        const [prompt, systemPrompt] = aiAssistantPrompts[promptType];

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPopup,
            args: [{
                text: `Loading...`
            }]
        });

        try {
            const settings = await new Promise((resolve) => {
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

            let response = null;
            switch (settings.platform) {
                case 'Gemini':
                    response = await apiHandlers.gemini.processText(
                        `${prompt}${selectedText}`,
                        settings.geminiApiKey,
                        settings.model
                    );
                    break;
                case 'Cloudflare Worker AI':
                    response = await apiHandlers.cloudflare.processText(
                        `${prompt}${selectedText}`,
                        settings.cloudflareId,
                        settings.cloudflareApiKey,
                        settings.model
                    );
                    break;
                case 'OpenRouter':
                    response = await apiHandlers.openrouter.processText(
                        `${prompt}${selectedText}`,
                        settings.openrouterApiKey,
                        settings.model
                    );
                    break;
                default:
                    throw new Error(`Unsupported platform: ${settings.platform}`);
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPopup,
                args: [{
                    text: response
                }]
            });
        } catch (error) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPopup,
                args: [{
                    text: `ERROR! ${error.message}`
                }]
            });
        }
    } else if (info.menuItemId === "ai-assistant-image-analysis") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getImageData,
            args: [info.srcUrl]
        }, async (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error getting image data:", chrome.runtime.lastError);
                return;
            }

            if (results && results.length > 0) {
                const { base64Content, mimeType } = results[0].result;
                
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: showPromptInput,
                    args: [info.srcUrl, 'image']
                });
            } else {
                console.error("Could not retrieve image data.");
            }
        });
    } else if (info.menuItemId === "ai-assistant-pdf-analysis") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [info.linkUrl, 'pdf']
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { text, prompt, apiKey, platform, model } = request.data;
                let response = null;
                switch (platform) {
                    case 'Gemini':
                        response = await apiHandlers.gemini.processText(prompt + text, apiKey, model);
                        break;
                    case 'Cloudflare Worker AI':
                        response = await apiHandlers.cloudflare.processText(prompt + text, apiKey, model);
                        break;
                    case 'OpenRouter':
                        response = await apiHandlers.openrouter.processText(prompt + text, apiKey, model);
                        break;
                    default:
                        throw new Error(`Unsupported platform: ${platform}`);
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