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
        'You are a writing assistant. Make the following text sound more friendly. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Make the following text sound more professional. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this concisely:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user concisely. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ]
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, promptType } = request.data;
                const [basePrompt, aiModelInstructions] = aiAssistantPrompts[promptType];

                const settings = await new Promise((resolve) => {
                    chrome.storage.sync.get(null, resolve);
                });
    
                const platform = settings.platform || 'Gemini';
                const model = settings.model || 'gemini-1.5-pro';
                const geminiApiKey = settings.geminiApiKey || '';
                const openrouterApiKey = settings.openrouterApiKey || '';
                const cloudflareId = settings.cloudflareId || '';
                const cloudflareApiKey = settings.cloudflareApiKey || '';
    
                let response;
    
                if (platform === 'Gemini') {
                    response = await apiHandlers.gemini.processText(
                        basePrompt + selectedText,
                        aiModelInstructions,
                        geminiApiKey,
                        model
                    );
                } else if (platform === 'OpenRouter') {
                    response = await apiHandlers.openrouter.processText(
                        basePrompt + selectedText,
                        aiModelInstructions,
                        openrouterApiKey,
                        model
                    );
                } else if (platform === 'Cloudflare Worker AI') {
                    response = await apiHandlers.cloudflare.processText(
                        basePrompt + selectedText,
                        aiModelInstructions,
                        cloudflareId,
                        cloudflareApiKey,
                        model
                    );
                } else {
                    sendResponse({ error: 'Invalid platform selected.' });
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