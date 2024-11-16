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
          
... (FILE CONTENT TRUNCATED) ...
        showNotification('Testing Gemini API...', 'info');
        try {
            const apiKey = document.getElementById('gemini-api-key').value;
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'This is a test.' }]
                    }]
                })
            });

            if (response.ok) {
                showNotification('Gemini API test successful!', 'success');
                document.getElementById('gemini-status').className = 'status-indicator status-ok';
            } else {
                showNotification('Gemini API test failed. Check your API key.', 'error');
                document.getElementById('gemini-status').className = 'status-indicator status-error';
            }
        } catch (error) {
            showNotification('Error testing Gemini API: ' + error.message, 'error');
            document.getElementById('gemini-status').className = 'status-indicator status-error';
        }
    } else {
        showNotification('Gemini API Key not set.', 'warning');
    }
}

async function testOpenRouterAPI() {
    const apiKey = document.getElementById('openrouter-api-key').value;
    if (apiKey) {
        showNotification('Testing OpenRouter API...', 'info');
        try {
            const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-medium',
                    messages: [{ role: 'user', content: 'This is a test.' }]
                })
            });

            if (response.ok) {
                showNotification('OpenRouter API test successful!', 'success');
                document.getElementById('openrouter-status').className = 'status-indicator status-ok';
            } else {
                showNotification('OpenRouter API test failed. Check your API key.', 'error');
                document.getElementById('openrouter-status').className = 'status-indicator status-error';
            }
        } catch (error) {
            showNotification('Error testing OpenRouter API: ' + error.message, 'error');
            document.getElementById('openrouter-status').className = 'status-indicator status-error';
        }
    } else {
        showNotification('OpenRouter API Key not set.', 'warning');
    }
}

async function testCloudflareAPI() {
    const accountId = document.getElementById('cloudflare-id').value;
    const apiKey = document.getElementById('cloudflare-api-key').value;
    if (accountId && apiKey) {
        showNotification('Testing Cloudflare API...', 'info');
        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'This is a test.' }]
                })
            });

            if (response.ok) {
                showNotification('Cloudflare API test successful!', 'success');
                 document.getElementById('cloudflare-status').className = 'status-indicator status-ok';
            } else {
                showNotification('Cloudflare API test failed. Check your API key and Account ID.', 'error');
                 document.getElementById('cloudflare-status').className = 'status-indicator status-error';
            }
        } catch (error) {
            showNotification('Error testing Cloudflare API: ' + error.message, 'error');
             document.getElementById('cloudflare-status').className = 'status-indicator status-error';
        }
    } else {
        showNotification('Cloudflare API Key and Account ID not set.', 'warning');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const platformSelect = document.getElementById('platform');
... (FILE CONTENT TRUNCATED) ...
istener('click', testGeminiAPI);
    }

    const testOpenRouterButton = document.getElementById('test-openrouter');
    if (testOpenRouterButton) {
        testOpenRouterButton.addEventListener('click', testOpenRouterAPI);
    }

    const testCloudflareButton = document.getElementById('test-cloudflare');
    if (testCloudflareButton) {
        testCloudflareButton.addEventListener('click', testCloudflareAPI);
    }

    // Initial API Status Check
    checkAPIStatus();

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

function checkAPIStatus() {
    // Placeholder for checking API status on startup
    // Implement logic to check the API keys are valid by making a call

    //For now, set them to unknown
    document.getElementById('gemini-status').className = 'status-indicator status-unknown';
    document.getElementById('openrouter-status').className = 'status-indicator status-unknown';
    document.getElementById('cloudflare-status').className = 'status-indicator status-unknown';
}