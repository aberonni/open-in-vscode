/* global document */

const defaultOptions = {
    remoteHost: '',
    basePath: '',
    insidersBuild: false,
    debug: false,
};

function restoreOptions() {
    chrome.storage.sync.get(defaultOptions, (options) => {
        document.getElementById('remoteHost').value = options.remoteHost;
        document.getElementById('basePath').value = options.basePath;
        document.getElementById('insidersBuild').checked = options.insidersBuild;
        document.getElementById('debug').checked = options.debug;
    });
}

function saveOptions(event) {
    event.preventDefault();

    chrome.storage.sync.set({
        remoteHost: document.getElementById('remoteHost').value,
        basePath: document.getElementById('basePath').value,
        insidersBuild: document.getElementById('insidersBuild').checked,
        debug: document.getElementById('debug').checked,
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
