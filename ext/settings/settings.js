const platformModels = {
    'Gemini': [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ],
    'Cloudflare Worker AI': [
        '@cf/meta/llama-2-7b-chat-int8'
    ],
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
    
    if (platform === 'OpenRouter') {
        useSpecificModel.disabled = false;
        customModelInput.disabled = !useSpecificModel.checked;
    } else {
        useSpecificModel.disabled = true;
        customModelInput.disabled = true;
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
        modelSelect.value = items.model || 'gemini-1.5-pro';
    }
    
    const useSpecificModelCheckbox = document.getElementById('use-specific-model');
    if (useSpecificModelCheckbox) {
        useSpecificModelCheckbox.checked = items.use_specific_model || false;
    }

    const customModelInput = document.getElementById('custom-model');
    if (customModelInput) {
        customModelInput.value = items.custom_model || '';
        customModelInput.disabled = !(items.use_specific_model || false);
    }

    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    if (geminiApiKeyInput) {
        geminiApiKeyInput.value = items.geminiApiKey || '';
    }

    const openrouterApiKeyInput = document.getElementById('openrouter-api-key');
    if (openrouterApiKeyInput) {
        openrouterApiKeyInput.value = items.openrouterApiKey || '';
    }

    const cloudflareAccountIdInput = document.getElementById('cloudflare-account-