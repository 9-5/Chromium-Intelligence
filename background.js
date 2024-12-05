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
        'You are a writing assistant. Rewrite the text provided by the user to be more friendly. Use emojis to express emotion. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Professional': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more professional. Remove emojis and slang. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Make Concise': [
        'Make this more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise. Remove unnecessary words. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-assistant-context-menu",
        title: "AI Assistant",
        contexts: ["selection", "image", "link"]
    });

    for (const key in aiAssistantPrompts) {
        chrome.contextMenus.create({
            id: `ai-assistant-${key}`,
            title: key,
            parentId: "ai-assistant-context-menu",
            contexts: ["selection"]
        });
    }
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId === "ai-assistant-context-menu") {
        return;
    }
    let action = data.menuItemId.replace("ai-assistant-", "");

    if (action) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: callGeminiApi,
            args: [data.selectionText, action]
        });
    }
    if (data.menuItemId === "ai-assistant-image") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getImageDetails,
            args: [data.srcUrl]
        });
    }
    if (data.menuItemId === "ai-assistant-link") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getPdfDetails,
            args: [data.linkUrl]
        });
    }
});

async function getPdfDetails(fileUrl) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showPromptInput', fileUrl: fileUrl, fileType: 'pdf' });
    });
}

async function getImageDetails(fileUrl) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showPromptInput', fileUrl: fileUrl, fileType: 'image' });
    });
}

function callGeminiApi(selectedText, action) {
    getSettings().then(settings => {
        chrome.runtime.sendMessage({
            action: 'callGeminiAPI',
            data: {
                selectedText: selectedText,
                action: action,
                platform: settings.platform,
                model: settings.use_specific_model ? settings.custom_model : settings.model,
                geminiApiKey: settings.geminiApiKey,
                openrouterApiKey: settings.openrouterApiKey,
                cloudflareId: settings.cloudflareId,
                cloudflareApiKey: settings.cloudflareApiKey,
                aiAssistantPrompts: aiAssistantPrompts
            }
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callGeminiAPI') {
        (async () => {
            try {
                const { selectedText, action, platform, model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey, aiAssistantPrompts } = request.data;
                let response;
                
                switch (platform) {
                    case 'Gemini':
                        response = await apiHandlers.gemini.processText(
                            selectedText,
                            action,
                            aiAssistantPrompts,
                            model,
                            geminiApiKey
                        );
                        break;
                    case 'Cloudflare Worker AI':
                        response = await apiHandlers.cloudflare.processText(
                            selectedText,
                            action,
                            aiAssistantPrompts,
                            model,
                            cloudflareId,
                            cloudflareApiKey
                        );
                        break;
                    case 'OpenRouter':
                        response = await apiHandlers.openrouter.processText(
                            selectedText,
                            action,
                            aiAssistantPrompts,
                            model,
                            openrouterApiKey
                        );
                        break;
                    default:
                        throw new Error(`Unsupported platform: ${platform}`);
                }

                chrome.scripting.executeScript({
                    target: { tabId: sender.tab.id },
                    function: showResult,
                    args: [response]
                });

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