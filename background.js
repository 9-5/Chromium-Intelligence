const aiAssistantPrompts = {
    'Proofread': [
        'Proofread this:\n\n',
        'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Rewrite': [
        'Rewrite this:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., gibberish, URLs, code snippets), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Friendly Tone': [
        'Make this sound more friendly:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to sound more friendly and approachable. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., gibberish, URLs, code snippets), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to sound more professional and formal. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., gibberish, URLs, code snippets), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this in a more concise manner:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise and to-the-point. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., gibberish, URLs, code snippets), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., gibberish, URLs, code snippets), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Image Description': [
        'Describe this image in detail:\n\n',
        'You are an image analysis assistant. Describe the provided image in as much detail as possible, including objects, colors, and overall scene. Output ONLY the description without any additional comments.'
    ],
    'Object Detection': [
        'Detect and list all objects present in this image:\n\n',
        'You are an image analysis assistant. Identify and list all distinct objects present in the provided image. Output ONLY the list of objects without any additional comments.'
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ai-assistant-text") {
        const selectedText = info.selectionText;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [selectedText, 'text']
        });
    } else if (info.menuItemId === "ai-assistant-image") {
        const imageUrl = info.srcUrl;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [imageUrl, 'image']
        });
    }
});

async function fetchSettings() {
    return new Promise((resolve) => {
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
}

chrome.runtime.onMessage.addListener((request, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { text, prompt } = request.data;
                const settings = await fetchSettings();

                let apiKey = '';
                if (settings.platform === 'Gemini') {
                    apiKey = settings.geminiApiKey;
                } else if (settings.platform === 'OpenRouter') {
                    apiKey = settings.openrouterApiKey;
                } else if (settings.platform === 'Cloudflare Worker AI') {
                    apiKey = settings.cloudflareApiKey;
                }

                const response = await apiHandlers.gemini.processText(text, prompt, apiKey);
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
                const { base64Content, mimeType, prompt } = request.data;
                const settings = await fetchSettings();

                let apiKey = '';
                if (settings.platform === 'Gemini') {
                    apiKey = settings.geminiApiKey;
                } else if (settings.platform === 'OpenRouter') {
                    apiKey = settings.openrouterApiKey;
                } else if (settings.platform === 'Cloudflare Worker AI') {
                    apiKey = settings.cloudflareApiKey;
                }
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