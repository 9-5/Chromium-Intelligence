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
... (FILE CONTENT TRUNCATED) ...
    const saveAPIKeysButton = document.getElementById('save-api-keys');
    if (saveAPIKeysButton) {
        saveAPIKeysButton.addEventListener('click', saveKeys);
    }

    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    if (geminiApiKeyInput) {
        geminiApiKeyInput.addEventListener('input', function() {
            localStorage.setItem('geminiApiKey', this.value);
        });
    }

    const openRouterApiKeyInput = document.getElementById('openrouter-api-key');
        if (openRouterApiKeyInput) {
        openRouterApiKeyInput.addEventListener('input', function() {
            localStorage.setItem('openrouterApiKey', this.value);
        });
    }

    const cloudflareIdInput = document.getElementById('cloudflare-id');
        if (cloudflareIdInput) {
        cloudflareIdInput.addEventListener('input', function() {
            localStorage.setItem('cloudflareId', this.value);
        });
    }

    const cloudflareApiKeyInput = document.getElementById('cloudflare-api-key');
    if (cloudflareApiKeyInput) {
         cloudflareApiKeyInput.addEventListener('input', function() {
            localStorage.setItem('cloudflareApiKey', this.value);
         });
    }

    const useSpecificModel = document.getElementById('use-specific-model');
    if (useSpecificModel) {
        useSpecificModel.addEventListener('change', handleUseSpecificModelChange);
    }

    const testGeminiButton = document.getElementById('test-gemini');
    if (testGeminiButton) {
        testGeminiButton.addEventListener('click', testGeminiAPI);
    }

    const testOpenRouterButton = document.getElementById('test-openrouter');
    if (testOpenRouterButton) {
        testOpenRouterButton.addEventListener('click', testOpenRouterAPI);
    }

    const testCloudflareButton = document.getElementById('test-cloudflare');
    if (testCloudflareButton) {
        testCloudflareButton.addEventListener('click', testCloudflareAPI);
    }

    showSection('settings-section');
}