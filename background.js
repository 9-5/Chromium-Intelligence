(function() {
    const aiAssistantPrompts = {
        'Proofread': [
            'Proofread this:\n\n',
            'You are a grammar proofreading assistant. Output ONLY the corrected text without any additional comments. Maintain the original text structure and writing style. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Rewrite': [
            'Rewrite this:\n\n',
            'You are a writing assistant. Rewrite the text provided by the user to improve phrasing. Output ONLY the rewritten text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with proofreading (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Friendly': [
            'Make this more friendly:\n\n',
            'You are a writing assistant. Rewrite the text provided by the user to be more friendly. Output ONLY the revised text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with rewriting (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Professional': [
            'Make this more professional:\n\n',
            'You are a writing assistant. Rewrite the text provided by the user to sound more professional. Output ONLY the revised text without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Concise': [
            'Make this more concise:\n\n',
            'You are a writing assistant. Rewrite the text provided by the user to be more concise. Output ONLY the concise version without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Summary': [
            'Summarize this:\n\n',
            'You are a summarization assistant. Provide a concise summary of the text provided by the user. Output ONLY the summary without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with summarization (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Key Points': [
            'Extract key points from this:\n\n',
            'You are an assistant that extracts key points from text provided by the user. Output ONLY the key points without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with extracting key points (e.g., totally random gibberish), output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Table': [
            'Convert this into a table:\n\n',
            'You are an assistant that converts text provided by the user into a table. Output ONLY the table without additional comments. Respond in the same language as the input (e.g., English US, French). If the text is absolutely incompatible with this with conversion, output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ],
        'Custom': [
            'Make the following change to this text:\n\n',
            'You are a writing and coding assistant. You MUST make the user\'s described change to the text or code provided by the user. Output ONLY the appropriately modified text or code without additional comments. Respond in the same language as the input (e.g., English US, French). If the text or code is absolutely incompatible with the requested change, output "ERROR_TEXT_INCOMPATIBLE_WITH_REQUEST".'
        ]
    };

    function getApiKey(callback) {
        chrome.storage.sync.get('api_key', function(data) {
            callback(data.api_key);
        });
    }

    function makeApiCall(apiKey, systemPrompt, prePrompt, textInput, callback) {
        const requestBody = {
            "system_instruction": {
                "parts": {
                    "text": systemPrompt
                }
            },
            "contents": {
                "parts": {
                    "text": `${prePrompt}${textInput}`
                }
            }
        };

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                callback(null, data.candidates[0].content.parts[0].text);
            } else {
                callback('No valid response from API', null);
            }
        })
        .catch(error => callback(error.toString(), null));
    }

    chrome.runtime.onInstalled.addListener(() => {
        for (const option in aiAssistantPrompts) {
            chrome.contextMenus.create({
                id: option,
                title: option,
                contexts: ["selection"],
            });
        }
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId in aiAssistantPrompts) {
            getApiKey((apiKey) => {
                if (apiKey) {
                    const textInput = info.selectionText;
                    const [prePrompt, systemPrompt] = aiAssistantPrompts[info.menuItemId];

                    makeApiCall(apiKey, systemPrompt, prePrompt, textInput, (error, response) => {
                        if (error) {
                            console.error('Error:', error);
                            chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: `Error: ${error}` });
                        } else {
                            chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: response });
                        }
                    });
                } else {
                    chrome.tabs.sendMessage(tab.id, { action: 'showPopup', data: 'API key not found' }); }
            });
        }
    });
})();
