function updateUI(items) {
    const platformSelect = document.getElementById('platform');
    const modelSelect = document.getElementById('model');
    const customModelInput = document.getElementById('custom-model');

    // Set platform
    if (items.platform) {
        platformSelect.value = items.platform;
    }

    // Set model and handle UI state
    if (items.platform === 'Gemini') {
        modelSelect.value = items.model || 'gemini-1.5-flash';
        modelSelect.disabled = false;
        customModelInput.value = '';
        customModelInput.disabled = true;
    } else {
        modelSelect.value = '';
        modelSelect.disabled = true;
        customModelInput.value = items.custom_model || '';
        customModelInput.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    chrome.storage.sync.get([
        'platform',
        'model',
        'custom_model'
    ], updateUI);

    // Platform change handler
    document.getElementById('platform').addEventListener('change', function() {
        const modelSelect = document.getElementById('model');
        const customModelInput = document.getElementById('custom-model');

        if (this.value === 'Gemini') {
            modelSelect.disabled = false;
            modelSelect.value = 'gemini-1.5-flash';
            customModelInput.value = '';
            customModelInput.disabled = true;
        } else {
            modelSelect.disabled = true;
            modelSelect.value = '';
            customModelInput.disabled = false;
            
            // Restore previous custom model if available
            chrome.storage.sync.get(['custom_model'], function(items) {
                if (items.custom_model) {
                    customModelInput.value = items.custom_model;
                }
            });
        }
    });

    // Save settings handler
    document.getElementById('save-popup-settings').addEventListener('click', function() {
        const platform = document.getElementById('platform').value;
        const model = document.getElementById('model').value;
        const customModel = document.getElementById('custom-model').value;

        chrome.storage.sync.set({
            platform: platform,
            model: model,
            custom_model: customModel,
            // Ensure these settings are synchronized with the main settings page
            useSpecificModel: platform !== 'Gemini'
        }, function() {
            // Show brief success message
            const button = document.getElementById('save-popup-settings');
            const originalText = button.textContent;
            button.textContent = 'Saved!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 1500);
        });
    });

    // Settings page link handler
    document.getElementById('settings-link').addEventListener('click', function(e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        chrome.storage.sync.get([
            'platform',
            'model',
            'custom_model'
        ], updateUI);
    }
});