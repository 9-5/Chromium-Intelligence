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
        'You are a text rewriting assistant. Rewrite the text provided by the user to have a friendly and approachable tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound professional:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to have a professional and formal tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise': [
        'Rewrite this concisely:\n\n',
        'You are a text rewriting assistant. Rewrite the text provided by the user to be concise and to the point, removing unnecessary words and phrases. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Custom': [
        '',
        ''
    ]
};

chrome.contextMenus.create({
    id: 'ai-assistant',
    title: 'AI Assistant',
    contexts: ['selection', 'image', 'link']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-proofread',
    title: 'Proofread',
    contexts: ['selection']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-rewrite',
    title: 'Rewrite',
    contexts: ['selection']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-friendly-tone',
    title: 'Friendly Tone',
    contexts: ['selection']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-professional-tone',
    title: 'Professional Tone',
    contexts: ['selection']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-concise',
    title: 'Concise',
    contexts: ['selection']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-summarize',
    title: 'Summarize',
    contexts: ['selection']
});

chrome.contextMenus.create({
    parentId: 'ai-assistant',
    id: 'ai-custom',
    title: 'Custom Prompt...',
    contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    const selectedText = info.selectionText;
    if (info.menuItemId === 'ai-proofread') {
        processText(selectedText, 'Proofread', tab);
    } else if (info.menuItemId === 'ai-rewrite') {
        processText(selectedText, 'Rewrite', tab);
    } else if (info.menuItemId === 'ai-friendly-tone') {
        processText(selectedText, 'Friendly Tone', tab);
    } else if (info.menuItemId === 'ai-professional-tone') {
        processText(selectedText, 'Professional Tone', tab);
    } else if (info.menuItemId === 'ai-concise') {
        processText(selectedText, 'Concise', tab);
    } else if (info.menuItemId === 'ai-summarize') {
        processText(selectedText, 'Summarize', tab);
    } else if (info.menuItemId === 'ai-custom') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPromptInput,
            args: [selectedText, 'text']
        });
    }
});

async function processText(selectedText, operation, tab) {
    try {
        const settings = await getSettings();
        const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = settings;
        let apiKey = '';

        if (platform === 'Gemini') {
            apiKey = geminiApiKey;
        } else if (platform === 'OpenRouter') {
            apiKey = openrouterApiKey;
        } else if (platform === 'Cloudflare Worker AI') {
            apiKey = cloudflareApiKey;
        }

        if (!apiKey && platform !== 'Cloudflare Worker AI') {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: showPopup,
                args: ['Please set your API key in the extension options.']
            });
            return;
        }
        
        if (operation !== 'Custom') {
            const prompt = aiAssistantPrompts[operation][0] + selectedText;
            const context = aiAssistantPrompts[operation][1];

            let response = null;
            if (platform === 'Gemini') {
                response = await apiHandlers.gemini.processText(prompt, context, apiKey, model);
            } else if (platform === 'OpenRouter') {
                response = await apiHandlers.openrouter.processText(prompt, context, apiKey, model);
            } else if (platform === 'Cloudflare Worker AI') {
                response = await apiHandlers.cloudflare.processText(prompt, context, cloudflareId, cloudflareApiKey, model);
            }

            if (response) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: showPopup,
                    args: [response]
                });
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: showPopup,
                    args: ['An error occurred while processing your request.']
                });
            }
        }
    } catch (error) {
        console.error('Error processing text:', error);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showPopup,
            args: [`Error: ${error.message}`]
        });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processCustomPrompt') {
        (async () => {
            try {
                const { selectedText, customPrompt } = request.data;
                const settings = await getSettings();
                const { platform, model, use_specific_model, custom_model, geminiApiKey, openrouterApiKey, cloudflareId, cloudflareApiKey } = settings;
                let apiKey = '';

                if (platform === 'Gemini') {
                    apiKey = geminiApiKey;
                } else if (platform === 'OpenRouter') {
                    apiKey = openrouterApiKey;
                } else if (platform === 'Cloudflare Worker AI') {
                    apiKey = cloudflareApiKey;
                }

                if (!apiKey && platform !== 'Cloudflare Worker AI') {
                    sendResponse({ data: 'Please set your API key in the extension options.' });
                    return;
                }

                const prompt = customPrompt + '\n\n' + selectedText;
                const context = 'You are an AI assistant.';

                let response = null;
                if (platform === 'Gemini') {
                    response = await apiHandlers.gemini.processText(prompt, context, apiKey, model);
                } else if (platform === 'OpenRouter') {
                    response = await apiHandlers.openrouter.processText(prompt, context, apiKey, model);
                } else if (platform === 'Cloudflare Worker AI') {
                    response = await apiHandlers.cloudflare.processText(prompt, context, cloudflareId, cloudflareApiKey, model);
                }

                if (response) {
                    sendResponse({ data: response });
                } else {
                    sendResponse({ data: 'An error occurred while processing your request.' });
                }
            } catch (error) {
                console.error('Error processing custom prompt:', error);
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