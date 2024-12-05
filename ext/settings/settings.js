const platformModels = {
    'Gemini': [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ],
    'Cloudflare Worker AI': [],
    'OpenRouter': []
};

const apiStatus = {
    'Gemini': 'unknown',
    'OpenRouter': 'unknown',
    'Cloudflare': 'unknown'
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
    
    if (platformSelect) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(platformSelect.value);
    }
    if (modelSelect) {
        modelSelect.value = items.model || platformModels[platformSelect.value][0];
    }
    if (customModelInput) {
        customModelInput.value = items.custom_model || '';
    }
    if (useSpecificModel) {
        useSpecificModel.checked = items.use_specific_model || false;
    }
}

function saveSettings() {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');
    const useSpecificModel = document.getElementById('use-specific-model');

    chrome.storage.sync.set({
        platform: platformSelect.value,
        model: modelSelect.value,
        custom_model: customModelInput.value,
        use_specific_model: useSpecificModel.checked
    }, () => {
        showNotification('Settings saved!', 'success');
    });
}

function saveApiKeys() {
    const geminiApiKey = document.getElementById('gemini-api-key').value;
    const openrouterApiKey = document.getElementById('openrouter-api-key').value;
    const cloudflareAccountId = document.getElementById('cloudflare-account-id').value;
    const cloudflareApiKey = document.getElementById('cloudflare-api-key').value;

    chrome.storage.sync.set({
        geminiApiKey: geminiApiKey,
        openrouterApiKey: openrouterApiKey,
        cloudflareId: cloudflareAccountId,
        cloudflareApiKey: cloudflareApiKey
    }, () => {
        showNotification('API Keys saved!', 'success');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('popup-notification', type);
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div class="message">${message}</div>
        <div class="close-btn">&times;</div>
    `;
    document.body.appendChild(notification);

    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.classList.add('hiding');
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    });

    setTimeout(() => {
        notification.classList.add('hiding');
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, 3000);
}

function testGeminiAPI() {
    const apiKey = document.getElementById('gemini-api-