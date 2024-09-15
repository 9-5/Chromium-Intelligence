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
    const customModelInput = document.getElementById('custom-model');
    const useSpecificModel = document.getElementById('use-specific-model');
    
    modelSelect.innerHTML = '';
    
    if (platformModels[platform] && platformModels[platform].length > 0) {
        platformModels[platform].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
    
    customModelInput.disabled = !useSpecificModel.checked;
    modelSelect.disabled = useSpecificModel.checked;
}

function updateUI(items) {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');
    const useSpecificModel = document.getElementById('use-specific-model');

    if (items.platform) {
        platformSelect.value = items.platform;
        populateModelDropdown(items.platform);
    }

    if (items.model) {
        modelSelect.value = items.model;
    }

    if (items['use_specific_model'] !== undefined) {
        useSpecificModel.checked = items['use_specific_model'];
    }

    if (items['custom_model']) {
        customModelInput.value = items['custom_model'];
    }

    customModelInput.disabled = !useSpecificModel.checked;
    modelSelect.disabled = useSpecificModel.checked;
}

function saveSettings() {
    const platform = document.getElementById('platform').value;
    const model = document.getElementById('model').value;
    const useSpecificModel = document.getElementById('use-specific-model').checked;
    const customModel = document.getElementById('custom-model').value;

    chrome.storage.sync.set({
        'platform': platform,
        'model': model,
        'use_specific_model': useSpecificModel,
        'custom_model': customModel
    }, function() {
        showNotification('Settings saved successfully!', 'success');
    });
}

function saveApiKeys() {
    const geminiApiKey = document.getElementById('gemini-api-key').value;
    const openrouterApiKey = document.getElementById('openrouter-api-key').value;
    const cloudflareAccountId = document.getElementById('cloudflare-account-id').value;
    const cloudflareApiKey = document.getElementById('cloudflare-api-key').value;

    chrome.storage.sync.set({
        'geminiApiKey': geminiApiKey,
        'openrouterApiKey': openrouterApiKey,
        'cloudflareId': cloudflareAccountId,