chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPopup') {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.bottom = '20px';
        popup.style.right = '20px';
        popup.style.width = '300px';
        popup.style.backgroundColor = 'white';
        popup.style.border = '1px solid #ccc';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        popup.style.zIndex = '10000';
        popup.style.padding = '10px';
        popup.innerHTML = `
            <textarea id="responseText" readonly style="width: 100%; height: 100px;">${request.data}</textarea>
            <button id="copyButton">Copy to Clipboard</button>
            <button id="closeButton">Close</button>
        `;

        document.body.appendChild(popup);

        const copyButton = popup.querySelector('#copyButton');
        const closeButton = popup.querySelector('#closeButton');

        copyButton.addEventListener('click', () => {
            const responseText = popup.querySelector('#responseText');
            responseText.select();
            document.execCommand('copy');
            alert('Copied to clipboard!');
        });

        closeButton.addEventListener('click', () => {
            popup.remove();
        });
    }
    return true;
});
