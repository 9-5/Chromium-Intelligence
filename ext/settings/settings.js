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
          
... (FILE CONTENT TRUNCATED) ...
ElementById('model');

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
        testGeminiAPI();
        testOpenRouterAPI();
        testCloudflareAPI();
    });
}

function testGeminiAPI() {
    const apiKey = document.getElementById('gemini-api-key').value;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey;
    const geminiStatus = document.getElementById('gemini-status');

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: "Test"
        })
    }).then(response => {
        if (response.ok) {
            apiStatus['Gemini'] = 'ok';
            geminiStatus.textContent = "OK";
            geminiStatus.className = "status-indicator status-ok";
        } else {
            apiStatus['Gemini'] = 'error';
            geminiStatus.textContent = "Error";
            geminiStatus.className = "status-indicator status-error";
        }
    }).catch(error => {
        apiStatus['Gemini'] = 'error';
        geminiStatus.textContent = "Error";
        geminiStatus.className = "status-indicator status-error";
        console.error('Error testing Gemini API:', error);
    });
}

function testOpenRouterAPI() {
    const apiKey = document.getElementById('openrouter-api-key').value;
    const apiUrl = 'https://api.openrouter.ai/v1/chat/completions';
    const openrouterStatus = document.getElementById('openrouter-status');

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "mistralai/mistral-medium",
            messages: [{ role: "user", content: "Test" }]
        })
    }).then(response => {
        if (response.ok) {
            apiStatus['OpenRouter'] = 'ok';
            openrouterStatus.textContent = "OK";
            openrouterStatus.className = "status-indicator status-ok";
        } else {
            apiStatus['OpenRouter'] = 'error';
            openrouterStatus.textContent = "Error";
            openrouterStatus.className = "status-indicator status-error";
        }
    }).catch(error => {
        apiStatus['OpenRouter'] = 'error';
        openrouterStatus.textContent = "Error";
        openrouterStatus.className = "status-indicator status-error";
        console.error('Error testing OpenRouter API:', error);
    });
}

function testCloudflareAPI() {
    const accountId = document.getElementById('cloudflare-id').value;
    const apiKey = document.getElementById('cloudflare-api-key').value;
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`;
    const cloudflareStatus = document.getElementById('cloudflare-status');

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "messages": [{"role": "user", "content": "Test"}]
        })
    }).then(response => {
        if (response.ok) {
            apiStatus['Cloudflare'] = 'ok';
            cloudflareStatus.textContent = "OK";
            cloudflareStatus.className = "status-indicator status-ok";
        } else {
            apiStatus['Cloudflare'] = 'error';
            cloudflareStatus.textContent = "Error";
            cloudflareStatus.className = "status-indicator status-error";
        }
    }).catch(error => {
        apiStatus['Cloudflare'] = 'error';
        cloudflareStatus.textContent = "Error";
        cloudflareStatus.className = "status-indicator status-error";
        console.error('Error testing Cloudflare API:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-api-keys');
    if (saveButton) {
        saveButton.addEventListener('click', saveAPIKeys);
    }

    document.querySelectorAll('.navbar a').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);

            document.querySelectorAll('.navbar a').forEach(a => {
                a.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    const useSpecificModel = document.getElementById('use-specific-model');
    if (useSpecificModel) {
        useSpecificModel.addEventListener('change', toggleModelSelection);
    }

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
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