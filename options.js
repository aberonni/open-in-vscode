const defaultOptions = {
    basePath: '/usr/local/git',
    insidersBuild: false,
};

function restoreOptions() {
    chrome.storage.sync.get(defaultOptions, (options) => {
        document.getElementById('basePath').value = options.basePath;
        document.getElementById('insidersBuild').checked = options.insidersBuild;
    });
}

function saveOptions(event) {
    event.preventDefault();

    chrome.storage.sync.set({
        basePath: document.getElementById('basePath').value,
        insidersBuild: document.getElementById('insidersBuild').checked,
    }, () => {
        // Update status to let user know options were saved.
        const status = document.querySelector('.alert');
        const statusClass = status.className;

        status.className += ' show';

        setTimeout(() => {
            status.className = statusClass;
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
