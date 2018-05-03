function getOptions() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({
            basePath: '',
            insidersBuild: false,
        }, (options) => {
            if (options.basePath === '') {
                reject(new Error('Set options in the options page for this extension.'));
                return;
            }

            resolve(options);
        });
    });
}

function getVscodeLink({
    repo, file, isFolder, line,
}) {
    return getOptions()
        .then(({ insidersBuild, basePath }) => {
            let vscodeLink = insidersBuild
                ? 'vscode-insiders'
                : 'vscode';

            vscodeLink += '://file';

            // windows paths don't start with slash
            if (basePath[0] !== '/') {
                vscodeLink += '/';
            }

            vscodeLink += `${basePath}/${repo}/${file}`;

            // opening a folder and not a file
            if (isFolder) {
                vscodeLink += '/';
            }

            if (line) {
                vscodeLink += `:${line}:1`;
            }

            return vscodeLink;
        });
}

function parseLink(linkUrl) {
    const url = new URL(linkUrl);
    const path = url.pathname;

    const pathRegexp = /.+\/([^/]+)\/(blob|tree)\/[^/]+\/(.*)/;

    if (!pathRegexp.test(path)) {
        throw Error('Invalid link.');
    }

    const pathInfo = pathRegexp.exec(path);

    const repo = pathInfo[1];
    const isFolder = pathInfo[2] === 'tree';
    const file = pathInfo[3];

    let line;

    if (url.hash.indexOf('#L') === 0) {
        line = url.hash.substring(2);
    }

    return {
        repo,
        file,
        isFolder,
        line,
    };
}

function openInVscode({ linkUrl }) {
    const linkInfo = parseLink(linkUrl);

    getVscodeLink(linkInfo)
        .then(window.open)
        .catch(alert);
}

chrome.contextMenus.create({
    title: 'Open in VSCode',
    contexts: ['link'],
    onclick: openInVscode,
});
