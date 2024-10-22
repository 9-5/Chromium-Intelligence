document.getElementById('copyButton').addEventListener('click', () => {
    const responseText = document.getElementById('responseText');
    responseText.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
});

document.getElementById('closeButton').addEventListener('click', () => {
    window.close();
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendResponse') {
        document.getElementById('responseText').value = request.data;
    }
});