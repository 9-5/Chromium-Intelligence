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

function updateUI(options) {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');

    if (platformSelect) {
        platformSelect.value = options.platform || 'Gemini';
        populateModelDropdown(options.platform || 'Gemini');
    }

    if (modelSelect) {
        modelSelect.value = options.model || platformModels[options.platform || 'Gemini'][0];
    }

    if (customModelInput) {
        customModelInput.value = options.customModel || '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(null, (options) => {
        updateUI(options);
    });

    const platformSelect = document.getElementById('platform');
    if (platformSelect) {
        platformSelect.addEventListener('change', () => {
            const platform = platformSelect.value;
            populateModelDropdown(platform);
        });
    }

    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    const saveApiKeysButton = document.getElementById('save-api-keys');
    if (saveApiKeysButton) {
        saveApiKeysButton.addEventListener('click', () => {
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
                showPopupNotification('Settings saved successfully!', 'success');
            });
        });
    }
    
    function showPopupNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `popup-notification ${type}`;
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
            }, { once: true });
        });
    
        setTimeout(() => {
            notification.classList.add('hiding');
            notification.addEventListener('animationend', () => {
                notification.remove();
            }, { once: true });
        }, 5000);
    }

    const testGeminiAPIButton = document.getElementById('test-gemini');
    if (testGeminiAPIButton) {
        testGeminiAPIButton.addEventListener('click', testGeminiAPI);
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