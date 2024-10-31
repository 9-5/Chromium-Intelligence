function toggleVisibility(inputId, iconId) {
    var input = document.getElementById(inputId);
    var icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function toggleModelSelection() {
    var useSpecificModel = document.getElementById('use-specific-model');
    var modelDropdown = document.getElementById('model');
    var customModelInput = document.getElementById('custom-model');
    var platformDropdown = document.getElementById('platform');

    if (useSpecificModel.checked || platformDropdown.value === "Cloudflare Worker AI" || platformDropdown.value === "OpenRouter") {
        modelDropdown.value = "";
        modelDropdown.disabled = true;
        customModelInput.disabled = false;
        useSpecificModel.checked = true;
    } else {
        modelDropdown.disabled = false;
        modelDropdown.value = "gemini-1.5-flash";
        customModelInput.value = "";
        customModelInput.disabled = true;
    }
}

function handlePlatformChange() {
    var platformDropdown = document.getElementById('platform');
    var useSpecificModel = document.getElementById('use-specific-model');
    var modelDropdown = document.getElementById('model');
    var customModelInput = document.getElementById('custom-model');

    if (platformDropdown.value === "Cloudflare Worker AI" || platformDropdown.value === "OpenRouter") {
        useSpecificModel.checked = true;
        modelDropdown.value = "";
        modelDropdown.disabled = true;
        customModelInput.disabled = false;
    } else {
        useSpecificModel.checked = false;
        modelDropdown.disabled = false;
        modelDropdown.value = "gemini-1.5-flash";
        customModelInput.disabled = true;
        customModelInput.value = "";
    }
}

function buttonStatus(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.popup-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `popup-notification ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span class="message">${message}</span>
        <i class="fas fa-times close-btn"></i>
    `;
    
    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// API Test Functions
async function testGeminiAPI() {
    const apiKey = document.getElementById('gemini-api-key').value;
    if (!apiKey) {
        buttonStatus('Please enter a Gemini API key.', 'error');
        return;
    }

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: {
                    parts: {
                        text: "Hello! This is a test message. Please respond with 'API test successful' if you receive this."
                    }
                }
            })
        });

        const data = await response.json();
        if (response.ok && data.candidates && data.candidates[0].content) {
            buttonStatus('Gemini API test successful!', 'success');
        } else {
            throw new Error(data.error?.message || 'Unknown error occurred');
        }
    } catch (error) {
        buttonStatus('Gemini API test failed: ' + error.message, 'error');
    }
}

async function testOpenRouterAPI() {
    const apiKey = document.getElementById('openrouter-api-key').value;
    if (!apiKey) {
        buttonStatus('Please enter an OpenRouter API key.', 'error');
        return;
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/johnle/chromium-intelligence',
                'X-Title': 'Chromium Intelligence'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: "Hello! This is a test message. Please respond with 'API test successful' if you receive this." }
                ]
            })
        });

        const data = await response.json();
        if (response.ok && data.choices && data.choices[0].message) {
            buttonStatus('OpenRouter API test successful!', 'success');
        } else {
            throw new Error(data.error?.message || 'Unknown error occurred');
        }
    } catch (error) {
        buttonStatus('OpenRouter API test failed: ' + error.message, 'error');
    }
}

async function testCloudflareAPI() {
    const accountId = document.getElementById('cloudflare-id').value;
    const apiKey = document.getElementById('cloudflare-api-key').value;
    
    if (!accountId || !apiKey) {
        buttonStatus('Please enter both Cloudflare Account ID and API Key', 'error');
        return;
    }

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: "Hello! This is a test message. Please respond with 'API test successful' if you receive this." }
                ]
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            buttonStatus('Cloudflare API test successful!', 'success');
        } else {
            throw new Error(data.errors?.[0]?.message || 'Unknown error occurred');
        }
    } catch (error) {
        buttonStatus('Cloudflare API test failed: ' + error.message, 'error');
    }
}

function loadSettings() {
    chrome.storage.sync.get({
        'platform': 'Gemini',
        'model': 'gemini-1.5-flash',
        'useSpecificModel': false,
        'custom_model': '', // Changed to match the key used in popup
        'geminiApiKey': '',
        'openrouterApiKey': '',
        'cloudflareId': '',
        'cloudflareApiKey': ''
    }, function(items) {
        document.getElementById('platform').value = items.platform;
        document.getElementById('model').value = items.model;
        document.getElementById('use-specific-model').checked = items.useSpecificModel;
        document.getElementById('custom-model').value = items.custom_model; // Changed to match the key used in popup
        document.getElementById('gemini-api-key').value = items.geminiApiKey;
        document.getElementById('openrouter-api-key').value = items.openrouterApiKey;
        document.getElementById('cloudflare-id').value = items.cloudflareId;
        document.getElementById('cloudflare-api-key').value = items.cloudflareApiKey;
        handlePlatformChange();
    });
}

function saveSettings() {
    chrome.storage.sync.set({
        platform: document.getElementById('platform').value,
        model: document.getElementById('model').value,
        useSpecificModel: document.getElementById('use-specific-model').checked,
        custom_model: document.getElementById('custom-model').value // Changed to match the key used in popup
    }, function() {
        buttonStatus('Settings saved!', 'success');
    });
}

function saveApiKeys() {
    chrome.storage.sync.set({
        geminiApiKey: document.getElementById('gemini-api-key').value,
        openrouterApiKey: document.getElementById('openrouter-api-key').value,
        cloudflareId: document.getElementById('cloudflare-id').value,
        cloudflareApiKey: document.getElementById('cloudflare-api-key').value
    }, function() {
        buttonStatus('API keys saved!', 'success');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();

    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSectionId = this.getAttribute('data-section');
            showSection(targetSectionId);
            
            // Update active state
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }

    const useSpecificModelCheckbox = document.getElementById('use-specific-model');
    if (useSpecificModelCheckbox) {
        useSpecificModelCheckbox.addEventListener('change', toggleModelSelection);
    }

    const saveSettingsButton = document.getElementById('save-settings');
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', saveSettings);
    }

    const saveApiKeysButton = document.getElementById('save-api-keys');
    if (saveApiKeysButton) {
        saveApiKeysButton.addEventListener('click', saveApiKeys);
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

    // Show initial section
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