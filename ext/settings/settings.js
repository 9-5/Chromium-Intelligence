const platformModels = {
    'Gemini': [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ],
    'Cloudflare Worker AI': [
        '@cf/meta/llama-2-7b-chat-int8',
        '@cf/meta/mpt-7b-chat',
        '@cf/microsoft/phi-2'
    ],
    'OpenRouter': [
        'openai/gpt-3.5-turbo',
        'openai/gpt-4',
        'google/gemini-1.5-pro',
        'anthropic/claude-v2'
    ]
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

document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.navbar a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            const sectionId = this.dataset.section;
            showSection(sectionId);
        });
    });

    // Load saved values
    chrome.storage.sync.get([
        'platform',
        'model',
        'use_specific_model',
        'custom_model',
        'geminiApiKey',
        'openrouterApiKey',
        'cloudflareId',
        'cloudflareApiKey'
    ], function(items) {
        document.getElementById('platform').value = items.platform || 'Gemini';
        populateModelDropdown(items.platform || 'Gemini');
        document.getElementById('model').value = items.model || 'gemini-1.5-pro';
        document.getElementById('use-specific-model').checked = items.use_specific_model || false;
        document.getElementById('custom-model').value = items.custom_model || '';
        document.getElementById('gemini-api-key').value = items.geminiApiKey || '';
        document.getElementById('openrouter-api-key').value = items.openrouterApiKey || '';
        document.getElementById('cloudflare-id').value = items.cloudflareId || '';
        document.getElementById('cloudflare-api-key').value = items.cloudflareApiKey || '';
    });