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
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');

    if (platformSelect) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(items.platform || 'Gemini');
    }

    if (modelSelect) {
        modelSelect.value = items.model || 'gemini-1.5-pro';
    }

    if (customModelInput) {
         customModelInput.value = items.custom_model || '';
    }
}

function saveSettings() {
    const platform = document.getElementById('platform').value;
    const model = document.getElementById('model').value;

    chrome.storage.sync.set({
        platform: platform,
        model: model,
    }, function() {
        console.log('Settings saved');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get([
        'platform',
        'model',
        'custom_model'
    ], updateUI);

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
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

function handlePlatformChange() {
    const platform = document.getElementById('platform').value;
    populateModelDropdown(platform);
}