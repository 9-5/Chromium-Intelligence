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

async function updateUI() {
    const items = await chrome.storage.sync.get([
        'platform',
        'model',
        'custom_model'
    ]);

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(platformSelect.value);
    }

    const modelSelect = document.getElementById('model');
    if (modelSelect) {
        modelSelect.value = items.model || platformModels[items.platform || 'Gemini'][0] || '';
    }

    const customModelInput = document.getElementById('custom-model');
    if (customModelInput) {
        customModelInput.value = items.custom_model || '';
    }
}

async function saveSettings() {
    const platform = document.getElementById('platform').value;
    const model = document.getElementById('model').value;
    const customModel = document.getElementById('custom-model').value;

    await chrome.storage.sync.set({
        platform: platform,
        model: model,
        custom_model: customModel
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await updateUI();

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

function handlePlatformChange() {
    const platform = document.getElementById('platform').value;
    populateModelDropdown(platform);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        updateUI();
    }
});