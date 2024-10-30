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
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();

    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('save-api-keys').addEventListener('click', saveApiKeys);

    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.navbar a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            showSection(this.getAttribute('data-section'));
        });
    });

    document.getElementById('platform').addEventListener('change', handlePlatformChange);
    document.getElementById('use-specific-model').addEventListener('change', toggleModelSelection);
    document.getElementById('use-specific-model').addEventListener('click', function(event) {
        var platformDropdown = document.getElementById('platform');
        if (platformDropdown.value === "Cloudflare Worker AI" || platformDropdown.value === "OpenRouter") {
            event.preventDefault();
        }
    });

    document.querySelectorAll('.toggle-visibility').forEach(icon => {
        icon.addEventListener('click', function() {
            toggleVisibility(this.previousElementSibling.id, this.id);
        });
    });

    showSection('settings-section');
});

function loadSettings() {
    chrome.storage.sync.get([
        'platform',
        'model',
        'use_specific_model',
        'custom_model',
        'gemini_api_key',
        'openrouter_api_key',
        'cloudflare_id',
        'cloudflare_api_key'
    ], function(items) {
        if (items.platform) document.getElementById('platform').value = items.platform;
        if (items.model) document.getElementById('model').value = items.model;
        if (items.custom_model) document.getElementById('custom-model').value = items.custom_model;
        document.getElementById('use-specific-model').checked = items.use_specific_model || false;
        if (items.gemini_api_key) document.getElementById('gemini-api-key').value = items.gemini_api_key;
        if (items.openrouter_api_key) document.getElementById('openrouter-api-key').value = items.openrouter_api_key;
        if (items.cloudflare_id) document.getElementById('cloudflare-id').value = items.cloudflare_id;
        if (items.cloudflare_api_key) document.getElementById('cloudflare-api-key').value = items.cloudflare_api_key;
        toggleModelSelection();
    });
}

function saveSettings() {
    var platform = document.getElementById('platform').value;
    var model = document.getElementById('model').value;
    var customModel = document.getElementById('custom-model').value;
    var useSpecificModel = document.getElementById('use-specific-model').checked;

    if (useSpecificModel && customModel) {
        model = customModel;
    }

    chrome.storage.sync.set({
        platform: platform,
        model: model,
        use_specific_model: useSpecificModel,
        custom_model: customModel
    }, function() {
        console.log('Settings saved');
        alert('Settings saved');
    });
}

function saveApiKeys() {
    var geminiApiKey = document.getElementById('gemini-api-key').value;
    var openrouterApiKey = document.getElementById('openrouter-api-key').value;
    var cloudflareId = document.getElementById('cloudflare-id').value;
    var cloudflareApiKey = document.getElementById('cloudflare-api-key').value;

    chrome.storage.sync.set({
        gemini_api_key: geminiApiKey,
        openrouter_api_key: openrouterApiKey,
        cloudflare_id: cloudflareId,
        cloudflare_api_key: cloudflareApiKey
    }, function() {
        console.log('API keys saved');
        alert('API keys saved');
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}