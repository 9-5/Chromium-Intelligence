const platformModels = {
    'Gemini': [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ],
    'Cloudflare Worker AI': [
        '@cf/meta/llama-2-7b-chat-int8',
        '@cf/meta/mpt-7b-chat',
        '@cf/microsoft/phi-2'
    ],
    'OpenRouter': [
        'openai/gpt-3.5-turbo',
        'openai/gpt-4',
        'google/gemini-1.5-pro',
        'anthropic/claude-v2'
    ]
};

function populateModelDropdown(platform) {
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '';
    
    if (platformModels[platform] && platformModels[platform].length > 0) {
        platformModels[platform].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
}

function updateUI(items) {
    const platformSelect = document.getElementById('platform');
    
... (FILE CONTENT TRUNCATED) ...
 (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }

    const saveButton = document.getElementById('save-popup-settings');
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }

    const settingsLink = document.getElementById('settings-link');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            chrome.runtime.openOptionsPage();
        });
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        chrome.storage.sync.get([
            'platform',
            'model',
            'custom_model'
        ], updateUI);
    }
});