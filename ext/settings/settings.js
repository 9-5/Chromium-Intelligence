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
        testCloudflareButton.addEventListener('click', testCloudflareAPI);
    }

    const saveCustomPromptButton = document.getElementById('save-custom-prompt');
    if (saveCustomPromptButton) {
        saveCustomPromptButton.addEventListener('click', saveCustomPrompt);
    }

    loadCustomPrompt();
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

function saveCustomPrompt() {
    const customPrompt = document.getElementById('custom-prompt').value;
    chrome.storage.sync.set({ 'customPrompt': customPrompt }, () => {
        showNotification('Custom prompt saved successfully!', 'success');
    });
}

function loadCustomPrompt() {
    chrome.storage.sync.get(['customPrompt'], (result) => {
        document.getElementById('custom-prompt').value = result.customPrompt || '';
    });
}