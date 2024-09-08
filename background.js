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
        'You are a writing assistant. Convert the text provided by the user into a more friendly tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Professional Tone': [
        'Make this sound more professional:\n\n',
        'You are a writing assistant. Convert the text provided by the user into a more professional tone. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Concise Rewrite': [
        'Rewrite this to be more concise:\n\n',
        'You are a writing assistant. Rewrite the text provided by the user to be more concise, removing unnecessary words. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Summarize': [
        'Summarize this:\n\n',
        'You are a summarization assistant. Summarize the text provided by the user. Output ONLY the summarized text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Translate': [
        'Translate this:\n\n',
        'You are a translation assistant. Translate the text provided by the user. Output ONLY the translated text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
    ],
    'Paraphrase': [
        'Paraphrase this:\n\n',
        'You are a paraphrasing assistant. Paraphrase the text provided by the user. Output ONLY the paraphrased text without any additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
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

    chrome.contextMenus.create({
        id: "ai-assistant-image",
        title: "Analyze Image",
        parentId: "ai-assistant-context-menu",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "ai-assistant-pdf",
        title: "Process PDF",
        parentId: "ai-assistant-context-menu",
        contexts: ["link"],
        documentUrlPatterns: ["*://*.pdf"]
    });
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (data.menuItemId === "ai-assistant-image") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getImageDetails,
            args: [data.srcUrl]
        });
    } else if (data.menuItemId === "ai-assistant-pdf") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getPdfDetails,
            args: [data.linkUrl]
        });
    } else if (data.menuItemId.startsWith('ai-assistant-')) {
        const action = data.menuItemId.replace('ai-assistant-', '');
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getTextSelection,
            args: [action]
        });
    }
});

async function getImageDetails(imageUrl) {
    try {
        const settings = await getSettings();
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const { base64Content, mimeType } = await convertBlobToBase64(blob);
        const prompt = `Analyze this image and describe its content. Be detailed and descriptive.`;

        chrome.runtime.sendMessage({
            action: 'processImage',
            data: {
                base64Content: base64Content,
                mimeType: mimeType,
                prompt: prompt,
                apiKey: settings.geminiApiKey
            }
        });
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

async function getPdfDetails(fileUrl) {
    chrome.runtime.sendMessage({ action: 'showPromptInput', fileUrl: fileUrl, fileType: 'pdf' });
}

async function getTextSelection(action) {
    chrome.runtime.sendMessage({ action: 'getTextSelection', selectedText: window.getSelection().toString(), aiAction: action });
}

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Content = reader.result.split(',')[1];
            resolve({ base64Content, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processText') {
        (async () => {
            try {
                const { selectedText, aiAction, apiKey } = request.data;
                const [promptPrefix, promptInstructions] = aiAssistantPrompts[aiAction];
                const fullPrompt = `${promptPrefix}${selectedText}\n\n${promptInstructions}`;

                const response = await apiHandlers.gemini.processText(fullPrompt, apiKey);
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