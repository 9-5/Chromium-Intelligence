document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-api-key');
    const apiKeyInput = document.getElementById('api-key');
    const testButton = document.getElementById('test-api-key');
    const statusMessage = document.getElementById('status-message');

    // Load the API key when the popup opens
    chrome.storage.sync.get('api_key', function(data) {
        if (data.api_key) {
            apiKeyInput.value = data.api_key;
        }
    });

    // Save API key
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                chrome.storage.sync.set({ 'api_key': apiKey }, function() {
                    if (chrome.runtime.lastError) {
                        showStatus('Error saving API key. Please try again.', 'error');
                    } else {
                        showStatus('API key saved successfully!', 'success');
                    }
                });
            } else {
                showStatus('Please enter an API key before saving.', 'error');
            }
        });
    }

    // Test API key
    if (testButton) {
        testButton.addEventListener('click', function() {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                showStatus('Testing API key...', 'info');
                chrome.runtime.sendMessage({ action: 'testApiKey' }, function(response) {
                    if (response.success) {
                        showStatus('API key is valid!', 'success');
                    } else {
                        showStatus(`API key test failed: ${response.message}`, 'error');
                    }
                });
            } else {
                showStatus('Please enter an API key before testing.', 'error');
            }
        });
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
});
