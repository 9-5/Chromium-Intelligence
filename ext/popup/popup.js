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

    if (platformSelect) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(platformSelect.value);
    }
    if (modelSelect) {
        modelSelect.value = items.model || platformModels[platformSelect.value][0];
    }

    if (customModelInput) {
        customModelInput.value = items.custom_model || '';
    }
}

function saveSettings() {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');

    chrome.storage.sync.set({
        platform: platformSelect.value,
        model: modelSelect.value,
        custom_model: customModelInput.value
    }, () => {
        console.log('Settings saved');
    });
}

function handlePlatformChange() {
    const platformSelect = document.getElementById('platform');
    populateModelDropdown(platformSelect.value);
    
    const modelSelect = document.getElementById('model');
    if (modelSelect && platformModels[platformSelect.value] && platformModels[platformSelect.value].length > 0) {
        modelSelect.value = platformModels[platformSelect.value][0];
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