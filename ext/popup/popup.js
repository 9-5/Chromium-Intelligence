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
    
    if (platformSelect) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(platformSelect.value);
    }

    const modelSelect = document.getElementById('model');
    if (modelSelect) {
        modelSelect.value = items.model || '';
    }

    const customModelInput = document.getElementById('custom-model');
    if (customModelInput) {
        customModelInput.value = items.custom_model || '';
        customModelInput.disabled = true; // Always disable, custom model is not applicable in this version.
    }
}

function saveSettings() {
    const platform = document.getElementById('platform').value;
    const model = document.getElementById('model').value;