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
        'Make this sound friendly:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more friendly. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound professional:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it sound more professional. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to make it more concise. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.contextMenus.create({
    id: "ai-assistant-image",
    title: "Analyze Image with AI",
    contexts: ["image"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ai-assistant-image") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getImageData,
            args: [info.srcUrl]
        });
    }
});

async function getImageData(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const { base64Content, mimeType } = await readFileAsDataURL(blob);
        
        chrome.runtime.sendMessage({
            action: 'showPromptInput',
            fileUrl: base64Content,
            fileType: mimeType
        });

        async function readFileAsDataURL(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Content = reader.result.split(',')[1];
                    const mimeType = reader.result.split(';')[0].split(':')[1];
                    resolve({ base64Content, mimeType });
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    } catch (error) {
        console.error("Error fetching image:", error);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'textRequest') {
        (async () => {
            try {
                const { selectedText, prompt } = request.data;
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
                let apiKey = settings.geminiApiKey;
                if (settings.platform === 'OpenRouter') {
                    apiKey = settings.openrouterApiKey;
                } else if (settings.platform === 'Cloudflare Worker AI') {
                    apiKey = settings.cloudflareApiKey;
                }

                const fullPrompt = aiAssistantPrompts[prompt][0] + selectedText + '\n\n' + aiAssistantPrompts[prompt][1];
                const response = await apiHandlers.gemini.processText(
                    fullPrompt,
                    settings.platform,
                    settings.model,
                    settings.use_specific_model ? settings.custom_model : null,
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