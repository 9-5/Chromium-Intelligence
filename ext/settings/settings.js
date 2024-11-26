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
    notification.classList.add('show');

    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.classList.remove('show');
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function testGeminiAPI() {
    const apiKey = document.getElementById('gemini-api-key').value;
    const statusIndicator = document.getElementById('gemini-status');
    statusIndicator.className = 'status-indicator status-unknown';

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: {
                    text: 'Test'
                }
            })
        });

        if (response.ok) {
            statusIndicator.className = 'status-indicator status-ok';
            showPopupNotification('Gemini API test successful', 'success');
        } else {
            statusIndicator.className = 'status-indicator status-error';
            showPopupNotification('Gemini API test failed', 'error');
        }
    } catch (error) {
        console.error('Error testing Gemini API:', error);
        statusIndicator.className = 'status-indicator status-error';
        showPopupNotification('Gemini API test failed', 'error');
    }
}

async function testOpenRouterAPI() {
    const apiKey = document.getElementById('openrouter-api-key').value;
    const statusIndicator = document.getElementById('openrouter-status');
    statusIndicator.className = 'status-indicator status-unknown';

    try {
        const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-1.5-pro',
                messages: [{ role: 'user', content: 'Test' }]
            })
        });

        if (response.ok) {
            statusIndicator.className = 'status-indicator status-ok';
            showPopupNotification('OpenRouter API test successful', 'success');
        } else {
            statusIndicator.className = 'status-indicator status-error';
            showPopupNotification('OpenRouter API test failed', 'error');
        }
    } catch (error) {
        console.error('Error testing OpenRouter API:', error);
        statusIndicator.className = 'status-indicator status-error';
        showPopupNotification('OpenRouter API test failed', 'error');
    }
}

async function testCloudflareAPI() {
    const accountId = document.getElementById('cloudflare-id').value;
    const apiKey = document.getElementById('cloudflare-api-key').value;
    const statusIndicator = document.getElementById('cloudflare-status');
    statusIndicator.className = 'status-indicator status-unknown';

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: 'Test'
            })
        });

        if (response.ok) {
            statusIndicator.className = 'status-indicator status-ok';
            showPopupNotification('Cloudflare API test successful', 'success');
        } else {
            statusIndicator.className = 'status-indicator status-error';
            showPopupNotification('Cloudflare API test failed', 'error');
        }
    } catch (error) {
        console.error('Error testing Cloudflare API:', error);
        statusIndicator.className = 'status-indicator status-error';
        showPopupNotification('Cloudflare API test failed', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.navbar a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);

            document.querySelectorAll('.navbar a').forEach(a => {
                a.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }

    const useSpecificModelCheckbox = document.getElementById('use-specific-model');
    if (useSpecificModelCheckbox) {
        useSpecificModelCheckbox.addEventListener('change', toggleCustomModelInput);
    }

    const saveButton = document.getElementById('save-api-keys');
    if (saveButton) {
        saveButton.addEventListener('click', saveAPIKeys);
    }

    const toggleGeminiApiKey = document.getElementById('toggle-gemini-api-key');
        toggleGeminiApiKey.addEventListener('click', function() {
            toggleVisibility('gemini-api-key');
        });

    const toggleOpenRouterApiKey = document.getElementById('toggle-openrouter-api-key');
        toggleOpenRouterApiKey.addEventListener('click', function() {
            toggleVisibility('openrouter-api-key');
        });

    const toggleCloudflareApiKey = document.getElementById('toggle-cloudflare-api-key');
        toggleCloudflareApiKey.addEventListener('click', function() {
            toggleVisibility('cloudflare-api-key');
        });

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

function toggleVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

function handlePlatformChange() {
    const platform = document.getElementById('platform').value;
    populateModelDropdown(platform);
}

function toggleCustomModelInput() {
    const useSpecificModel = document.getElementById('use-specific-model');
    const customModelInput = document.getElementById('custom-model');
    const modelSelect = document.getElementById('model');

    customModelInput.disabled = !useSpecificModel.checked;
    modelSelect.disabled = useSpecificModel.checked;
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
    }, () => {
        showPopupNotification('API keys saved successfully');
    });
}