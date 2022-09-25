const PULL_REQUEST_PATH_REGEXP = /\/?(.*)\/([^/]+)\/(pull)\/[^/]+\/(.*)/;

class OptionValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OptionValidationError';
    }
}

async function getOptions() {
    const options = await chrome.storage.sync.get({
        remoteHost: '',
        basePath: '',
        basePathFormat: '{basePath}/{repoName}',
        insidersBuild: false,
        debug: false,
    });

    if (options.basePath === '') {
        throw new OptionValidationError('Looks like you haven\'t configured this extension yet. You can find more information about this by visiting the extension\'s README page.');
    }

    return options;
}

function getVscodeLink({
    repoPath, repo, file, isFolder, line,
}, {
    remoteHost, insidersBuild, basePath, basePathFormat, debug,
}) {
    let vscodeLink = insidersBuild
        ? 'vscode-insiders'
        : 'vscode';

    // vscode://vscode-remote/ssh-remote+[host]/[path/to/file]:[line]
    // OR
    // vscode://file/[path/to/file]:[line]
    if (remoteHost !== '') {
        vscodeLink += `://vscode-remote/ssh-remote+${remoteHost}`;
    } else {
        vscodeLink += '://file';
    }

    // windows paths don't start with slash
    if (basePath[0] !== '/') {
        vscodeLink += '/';
    }

    switch (basePathFormat) {
        case '{basePath}/{repoPath}/{repoName}':
            vscodeLink += `${basePath}/${repoPath}/${repo}/${file}`;
            break;
        case '{basePath}/{repoName}':
        default:
            vscodeLink += `${basePath}/${repo}/${file}`;
            break;
    }

    // opening a folder and not a file
    if (isFolder) {
        vscodeLink += '/';
    }

    if (line) {
        vscodeLink += `:${line}:1`;
    }

    if (debug) {
        // eslint-disable-next-line no-console
        console.log(`About to open link: ${vscodeLink}`);
    }

    return vscodeLink;
}

function isPR(linkUrl) {
    return PULL_REQUEST_PATH_REGEXP.test(linkUrl);
}

function parseLink(linkUrl, selectionText, pageUrl) {
    const url = new URL(linkUrl ?? pageUrl);
    const path = url.pathname;

    if (isPR(url.pathname)) {
        const pathInfo = PULL_REQUEST_PATH_REGEXP.exec(path);
        const repoPath = pathInfo[1];
        const repo = pathInfo[2];
        const isFolder = false;
        const file = selectionText;
        let line = null;
        if (pageUrl.includes(linkUrl)) {
            line = pageUrl.replace(linkUrl, '').replace('R', '').replace('L', '');
        }
        return {
            repoPath,
            repo,
            file,
            isFolder,
            line,
        };
    }

    const pathRegexp = /\/?(.*)\/([^/]+)\/(blob|tree)\/[^/]+\/(.*)/;

    if (!pathRegexp.test(path)) {
        throw new Error(`Invalid link. Could not extract info from: ${path}.`);
    }

    const pathInfo = pathRegexp.exec(path);

    const repoPath = pathInfo[1];
    const repo = pathInfo[2];
    const isFolder = pathInfo[3] === 'tree';
    const file = pathInfo[4];

    let line;

    if (url.hash.indexOf('#L') === 0) {
        line = url.hash.substring(2);
    }

    return {
        repoPath,
        repo,
        file,
        isFolder,
        line,
    };
}

async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function injectedAlert(message) {
    // eslint-disable-next-line no-undef
    alert(message);
}

function injectedWindowOpen(url) {
    // eslint-disable-next-line no-undef
    window.open(url);
}

async function openInVscode({ linkUrl, selectionText, pageUrl }) {
    let tab;
    try {
        tab = await getCurrentTab();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error');
        // eslint-disable-next-line no-console
        console.error(e);
        return;
    }

    try {
        const options = await getOptions();
        const parsedLinkData = parseLink(linkUrl, selectionText, pageUrl);
        const url = getVscodeLink(parsedLinkData, options);
        await chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: injectedWindowOpen,
                args: [url],
            },
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        await chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: injectedAlert,
                args: [e.message ?? e],
            },
        );
        if (e.name === 'OptionValidationError') {
            chrome.runtime.openOptionsPage();
        }
    }
}

const contextMenuId = 'open-in-vscode-context-menu';

chrome.contextMenus.create({
    id: contextMenuId,
    title: 'Open in VSCode',
    contexts: ['link', 'page'],
});

chrome.contextMenus.onClicked.addListener(({ menuItemId, ...info }) => {
    if (menuItemId !== contextMenuId) {
        return;
    }

    openInVscode(info);
});

chrome.action.onClicked.addListener((({ url }) => {
    openInVscode({ linkUrl: url, pageUrl: url });
}));
