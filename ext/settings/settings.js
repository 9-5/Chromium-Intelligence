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
        useSpecificModel.disabled = false;
    } else {
        useSpecificModel.disabled = true;
    }

    useSpecificModel.addEventListener('change', function() {
        customModelInput.disabled = !this.checked;
    });
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
        showNotification('Settings saved!', 'success');
    });
}

function saveAPIKeys() {
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
        showNotification('API Keys saved!', 'success');
    });
}

function showNotification(message, type = 'success') {
    const notification = document.querySelector('.popup-notification');
    notification.querySelector('.message').textContent = message;
    notification.classList.remove('success', 'error', 'hiding');
    notification.classList.add(type);
    notification.style.display = 'flex';

    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
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
            contents: [{
                parts: [{
                    text: "This is a test."
                }]
            }]
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
        showNotification('Error testing Gemini API key.', 'error');
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
        showNotification('Error testing OpenRouter API key.', 'error');
    });
}

function testCloudflareAPI() {
    const accountId = document.getElementById('cloudflare-id').value;
    const apiKey = document.getElementById('cloudflare-api-key').value;

    if (!accountId || !apiKey) {
        showNotification('Please enter your