// settings.js

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

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
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
    document.getElementById('use-specific-model').addEventListener('click', function(event) {
        var platformDropdown = document.getElementById('platform');
        if (platformDropdown.value === "Cloudflare Worker AI" || platformDropdown.value === "OpenRouter") {
            event.preventDefault();
        }
    });
    showSection('settings-section');

    // Add event listeners for toggle visibility buttons
    document.querySelectorAll('.toggle-visibility').forEach(icon => {
        icon.addEventListener('click', function() {
            toggleVisibility(this.previousElementSibling.id, this.id);
        });
    });
});