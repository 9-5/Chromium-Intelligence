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
            const option = document.cre
... (FILE CONTENT TRUNCATED) ...
        updateAPIStatus('OpenRouter', 'error');
        showPopupNotification('OpenRouter API test failed', 'error');
    }
}

async function testCloudflareAPI() {
    const accountId = document.getElementById('cloudflare-id').value;
    const apiKey = document.getElementById('cloudflare-api-key').value;
    
    try {
        const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + accountId, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            updateAPIStatus('Cloudflare', 'success');
            showPopupNotification('Cloudflare API test successful', 'success');
        } else {
            updateAPIStatus('Cloudflare', 'error');
            showPopupNotification('Cloudflare API test failed', 'error');
        }
    } catch (error) {
        console.error("Cloudflare API test error:", error);
        updateAPIStatus('Cloudflare', 'error');
        showPopupNotification('Cloudflare API test failed', 'error');
    }
}

function updateAPIStatus(platform, status) {
    apiStatus[platform] = status;
    const statusElementId = `${platform.toLowerCase()}-status`;
    const statusElement = document.getElementById(statusElementId);

    if (statusElement) {
        statusElement.classList.remove('status-unknown', 'status-success', 'status-error');
        statusElement.classList.add(`status-${status}`);
        statusElement.textContent = status.toUpperCase();
    }
}

function showPopupNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.classList.add('popup-notification', type);
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span class="message">${message}</span>
        <span class="close-btn">&times;</span>
    `;
    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
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
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');
    const useSpecificModel = document.getElementById('use-specific-model');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const openrouterApiKeyInput = document.getElementById('openrouter-api-key');
    const cloudflareIdInput = document.getElementById('cloudflare-id');
    const cloudflareApiKeyInput = document.getElementById('cloudflare-api-key');
    
    function handlePlatformChange() {
        const selectedPlatform = platformSelect.value;
        populateModelDropdown(selectedPlatform);
    
        if (selectedPlatform === 'OpenRouter' || selectedPlatform === 'Cloudflare Worker AI') {
            useSpecificModel.disabled = true;
            customModelInput.disabled = true;
        } else {
            useSpecificModel.disabled = false;
            customModelInput.disabled = !useSpecificModel.checked;
        }
    }

    function handleUseSpecificModelChange() {
        customModelInput.disabled = !useSpecificModel.checked;
    }

    function saveSettings() {
        const platform = platformSelect.value;
        const model = modelSelect.value;
        const customModel = customModelInput.value;
        const useSpecific = useSpecificModel.checked;
    
        chrome.storage.sync.set({
            platform: platform,
            model: model,
            custom_model: customModel,
            use_specific_model: useSpecific
        }, () => {
            console.log('Settings saved');
        });
    }

    function saveAPIKeys() {
        const geminiApiKey = geminiApiKeyInput.value;
        const openrouterApiKey = openrouterApiKeyInput.value;
        const cloudflareId = cloudflareIdInput.value;
        const cloudflareApiKey = cloudflareApiKeyInput.value;

        chrome.storage.sync.set({
            geminiApiKey: geminiApiKey,
            openrouterApiKey: openrouterApiKey,
            cloudflareId: cloudflareId,
            cloudflareApiKey: cloudflareApiKey
        }, () => {
            console.log('API keys saved');
        });
    }

    function updateUI(items) {
        platformSelect.value = items.platform || 'Gemini';
        populateModelDropdown(items.platform || 'Gemini');
        modelSelect.value = items.model || platformModels['Gemini'][0];
        customModelInput.value = items.custom_model || '';
        useSpecificModel.checked = items.use_specific_model !== false;
        customModelInput.disabled = !useSpecificModel.checked;

        geminiApiKeyInput.value = items.geminiApiKey || '';
        openrouterApiKeyInput.value = items.openrouterApiKey || '';
        cloudflareIdInput.value = items.cloudflareId || '';
        cloudflareApiKeyInput.value = items.cloudflareApiKey || '';
    }

    chrome.storage.sync.get([
        'platform',
        'model',
        'use_specific_model',
        'custom_model',
        'geminiApiKey',
        'openrouterApiKey',
        'cloudflareId',
        'cloudflareApiKey'
    ], updateUI);
    
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    if (useSpecificModel) {
        useSpecificModel.addEventListener('change', handleUseSpecificModelChange);
    }

    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }

    const saveApiKeysButton = document.getElementById('save-api-keys');
    if (saveApiKeysButton) {
        saveApiKeysButton.addEventListener('click', saveAPIKeys);
    }

    const toggleGeminiApiKey = document.getElementById('toggle-gemini-api-key');
    if (toggleGeminiApiKey) {
        toggleGeminiApiKey.addEventListener('click', () => {
            if (geminiApiKeyInput.type === "password") {
                geminiApiKeyInput.type = "text";
            } else {
                geminiApiKeyInput.type = "password";
            }
        });
    }

    const toggleOpenRouterApiKey = document.getElementById('toggle-openrouter-api-key');
    if (toggleOpenRouterApiKey) {
        toggleOpenRouterApiKey.addEventListener('click', () => {
            if (openrouterApiKeyInput.type === "password") {
                openrouterApiKeyInput.type = "text";
            } else {
                openrouterApiKeyInput.type = "password";
            }
        });
    }

    const toggleCloudflareApiKey = document.getElementById('toggle-cloudflare-api-key');
    if (toggleCloudflareApiKey) {
        toggleCloudflareApiKey.addEventListener('click', () => {
            if (cloudflareApiKeyInput.type === "password") {
                cloudflareApiKeyInput.type = "text";
            } else {
                cloudflareApiKeyInput.type = "password";
            }
        });
    }

    const geminiTestButton = document.getElementById('test-gemini');
    if (geminiTestButton) {
        geminiTestButton.addEventListener('click', testGeminiAPI);
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
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}