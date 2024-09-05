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

        // Enable/disable custom model input based on platform and checkbox state
        if (platform === 'Cloudflare Worker AI' || platform === 'OpenRouter') {
            useSpecificModel.disabled = false;
            customModelInput.disabled = !useSpecificModel.checked;
        } else {
            useSpecificModel.disabled = true;
            customModelInput.disabled = true;
            useSpecificModel.checked = false; // Uncheck if disabled
        }
    }
}

function updateUI(items) {
    document.getElementById('platform').value = items.platform || 'Gemini';
    populateModelDropdown(items.platform || 'Gemini');
    document.getElementById('model').value = items.model || 'gemini-1.5-pro';
    document.getElementById('use-specific-model').checked = items.use_specific_model || false;
    document.getElementById('custom-model').value = items.custom_model || '';
    document.getElementById('gemini-api-key').value = items.geminiApiKey || '';
    document.getElementById('openrouter-api-key').value = items.openrouterApiKey || '';
    document.getElementById('cloudflare-id').value = items.cloudflareId || '';
    document.getElementById('cloudflare-api-key').value = items.cloudflareApiKey || '';
}

function saveSettings() {
    const platform = document.getElementById('platform').value;
    const model = document.getElementById('model').value;
    const useSpecificModel = document.getElementById('use-specific-model').checked;
    const customModel = document.getElementById('custom-model').value;

     chrome.storage.sync.set({
        platform: platform,
        model: model,
        use_specific_model: useSpecificModel,
        custom_model: customModel
    }, function() {
        showPopupNotification('Settings saved successfully!', 'success');
    });
}

function saveApiKeys() {
    const geminiApiKey = document.getElementById('gemini-api-key').value;
    const openrouterApiKey = document.getElementById('openrouter-api-key').value;
    const cloudflareId = document.getElementById('cloudflare-id').value;
    const cloudflareApiKey = document.getElementById('cloudflare-api-key').value;

    chrome.storage.sync.set({
        geminiApiKey: geminiApiKey,
        openrouterApiKey: openrouterApiKey,
        cloudflareId: cloudflareId,
        cloudflareApiKey: cloudflareApiKey
    }, function() {
        showPopupNotification('API Keys saved successfully!', 'success');
    });
}

function testGeminiAPI() {
    const apiKey = document.getElementById('gemini-api-key').value;
    if (!apiKey) {
        showPopupNotification('Please enter your Gemini API key.', 'error');