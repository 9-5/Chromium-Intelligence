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

    // Initial population of models
    const platform = document.getElementById('platform').value;
    populateModelDropdown(platform);

    showSection('settings-section');
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}