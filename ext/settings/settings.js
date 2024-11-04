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
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const openRouterApiKeyInput = document.getElementById('openrouter-api-key');
    const cloudflareIdInput = document.getElementById('cloudflare-id');
    const cloudflareApiKeyInput = document.getElementById('cloudflare-api-key');

    if (platformSelect) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(items.platform || 'Gemini');
    }

    if (modelSelect) {
        modelSelect.value = items.model || platformModels['Gemini'][0];
    }

    if (useSpecificModel) {
         useSpecificModel.checked = items.use_specific_model || false;