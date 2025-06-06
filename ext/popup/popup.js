const platformModels = {
    'Gemini': [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ],
    'Cloudflare Worker AI': [],
    'OpenRouter': []
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

    if (items.platform) {
        platformSelect.value = items.platform;
    }

    populateModelDropdown(items.platform);

    if (items.platform === 'Gemini') {
        modelSelect.disabled = false;
        setTimeout(() => {
            modelSelect.value = items.model || 'gemini-1.5-flash';
        }, 0);
        customModelInput.value = '';
        customModelInput.disabled = true;
    } else {
        modelSelect.disabled = true;
        modelSelect.value = '';
        customModelInput.value = items.custom_model || '';
        customModelInput.disabled = false;
    }
}

function saveSettings() {
    const platform = document.getElementById('platform').value;
    const model = document.getElementById('model').value;
    const customModel = document.getElementById('custom-model').value;

    chrome.storage.sync.set({
        platform: platform,
        model: model,
        custom_model: customModel,
        useSpecificModel: platform !== 'Gemini'
    }, function() {
        const button = document.getElementById('save-popup-settings');
        const originalText = button.textContent;
        button.textContent = 'Saved!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1500);
    });
}

function handlePlatformChange() {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');

    populateModelDropdown(platformSelect.value);

    if (platformSelect.value === 'Gemini') {
        modelSelect.disabled = false;
        modelSelect.value = 'gemini-1.5-flash';
        customModelInput.value = '';
        customModelInput.disabled = true;
    } else {
        modelSelect.disabled = true;
        modelSelect.value = '';
        customModelInput.disabled = false;
        
        chrome.storage.sync.get(['custom_model'], function(items) {
            if (items.custom_model) {
                customModelInput.value = items.custom_model;
            }
        });
    }
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