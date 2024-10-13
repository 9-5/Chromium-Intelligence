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

function updateUI(options) {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');

    if (platformSelect) {
        platformSelect.value = options.platform || 'Gemini';
        populateModelDropdown(options.platform || 'Gemini');
    }

    if (modelSelect) {
        modelSelect.value = options.model || platformModels[options.platform || 'Gemini'][0];
    }

    if (customModelInput) {
        customModelInput.value = options.customModel || '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(null, (options) => {
        updateUI(options);
    });

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.addEventListener('change', () => {
            const platform = platformSelect.value;
            populateModelDropdown(platform);
        });
    }

    const saveButton = document.getElementById('save-popup-settings');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const platform = document.getElementById('platform').value;
            const model = document.getElementById('model').value;
            const customModel = document.getElementById('custom-model').value;
            
            chrome.storage.sync.set({
                platform: platform,
                model: model,
                customModel: customModel
            });
        });
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
        chrome.storage.sync.get(null, updateUI);
    }
});