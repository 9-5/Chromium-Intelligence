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
        customModelInput.disabled = true;
    } else {
        customModelInput.disabled = false;
    }
}

function updateUI(items) {
    const platformSelect = document.getElementById('platform');
    if (items.platform) {
        platformSelect.value = items.platform;
        populateModelDropdown(items.platform);
    }

    const modelSelect = document.getElementById('model');
    if (items.model) {
        modelSelect.value = items.model;
    }

    const useSpecificModelCheckbox = document.getElementById('use-specific-model');
     if (items.use_specific_model !== undefined) {
        useSpecificModelCheckbox.checked = items.use_specific_model;
    }

    const customModelInput = document.getElementById('custom-model');
    if (items.custom_model) {
        customModelInput.value = items.custom_model;
    }

    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    if (items.geminiApiKey) {
        geminiApiKeyInput.value = items.geminiApiKey;
    }

    const openrouterApiKeyInput = document.getElementById('openrouter-api-key');
    if (items.openrouterApiKey) {
        openrouterApiKeyInput.value = items.openrouterApiKey;
    }

    const cloudflareIdInput = document.getElementById('cloudflare-id');
    if (items.cloudflareId) {
        cloudflareIdInput.value = items.cloudflareId;
    }

    const cloudflareApiKeyInput = document.getElementById('cloudflare-api-key');
    if (items.cloudflareApiKey) {
        cloudflareApiKeyInput.value = items.cloudflareApiKey;
    }
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
    }, () => {
        showNotification('Settings saved successfully!', 'success');
    });
}

function saveAPIKeys() {
    const geminiApiKey = document.getElementById('gemini-api-key').value;
    const openrouterApiKey = document.getElementById('openrouter-api-key').value;
    const cloudflareId = document.getElementById('cloudflare-id').value;
    const cloudflareApiKey = document.getElementById('cloudflare-api-key').value;
    
    chrome.storage.sync.set({
        'geminiApiKey': geminiApiKey,
        'openrouterApiKey': openrouterApiKey,
        'cloudflareId': cloudflareId,
        'cloudflareApiKey': cloudflareApiKey
    }, () => {
        showNotification('API Keys saved successfully!', 'success');
    });
}

function testGeminiAPI() {
    const apiKey = document.getElementById('gemini-api-key').value;
    if (!apiKey) {
        showNotification('Please enter your Gemini API key.', 'error');
        return;
    }

    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: "This is a test.",
            contents: [{ parts: [{ text: "This is a test." }] }]
        })
    })
    .then(response => {
        if (response.ok) {
            showNotification('Gemini API key is valid!', 'success');
        } else {
            showNotification('Gemini API key is invalid.', 'error');
        }
    })
    .catch(error => {
        showNotification('Error testing Gemini API: ' + error.message, 'error');
    });
}

function testOpenRouterAPI() {
    const apiKey = document.getElementById('openrouter-api-key').value;
    if (!apiKey) {
        showNotification('Please enter your OpenRouter API key.', 'error');
        return;
    }

    fetch('https://api.openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "google/gemini-1.5-pro",
            messages: [{ role: "user", content: "This is a test." }]
        })
    })
    .then(response => {
        if (response.ok) {
            showNotification('OpenRouter API key is valid!', 'success');
        } else {
            showNotification('OpenRouter API key is invalid.', 'error');
        }
    })
    .catch(error => {
        showNotification