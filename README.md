# Open in VSCode

> Open links to source code in VSCode.

![Screenshot](screenshot.png)

[![CI](https://github.com/aberonni/open-in-vscode/actions/workflows/ci.yml/badge.svg)](https://github.com/aberonni/open-in-vscode/actions/workflows/ci.yml)

## Installation

Just [install from the Chrome Web Store](https://chrome.google.com/webstore/detail/open-in-vscode/pfakkjlkpobjeghlgipljkjmbgcanpji). Once you have installed, make sure to configure the extension in the options page.
You can do this by right clicking on the "Open in VSCode" icon in the extensions bar on chrome, and then selecting "Options".

## Usage

__The extension expects the repository you are browsing to already be cloned into the "base path" that you must first define in the options page.__

Use in one of three ways:

- Right click on any link to a file and select "Open in VSCode". You can also click on line links to open the file to the specific file.
- Right click anywhere on a page and select "Open in VSCode" to open the currently viewed file
- Click on the extension icon in the toolbar to open the currently viewed file

Tested with the following websites:

- Github (no line support)
- Gitlab

It might work on some other websites as well (no guarantee), if you do discover that it works on other websites please [let me know](https://github.com/aberonni/open-in-vscode/issues/new) so I can add it to the list!

## All I see is a blank page

This could be happening for numerous reasons. Make sure you have set the options correctly in the options page.
If you want, you can check what URL the extension is trying to open by enabling the debug mode in the options.
You might want to [check out how VSCode handles links](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls).

## Feedback

If you are having any issues, or would like to request a new feature, don't hesitate to [open an issue on github](https://github.com/aberonni/open-in-vscode/issues)!

## Development

### Prerequisites

- Node.js (>= 18 recommended)
- npm

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/aberonni/open-in-vscode.git
cd open-in-vscode
npm ci
```

### Running Tests

Jest is configured to collect coverage automatically.

```bash
npm test
```

For watch mode while iterating:

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

### Building the Extension

There is currently no build step; the source under `src/` is used directly by Chrome. If a build is introduced (e.g. bundling, TypeScript), update the CI workflow accordingly.

### End-to-End (Integration) Test with Playwright

Playwright is configured to perform a minimal integration test that:

1. Launches Chromium with the extension loaded.
2. Opens the options page and saves a fake base path.
3. Navigates to this GitHub repository.
4. Simulates the context-menu action by stubbing `window.open` and invoking the equivalent logic.
5. Asserts that a `vscode://` (or `vscode-insiders://`) style URL matching the expected repository path would be opened.

Run the E2E test (headed, because Chrome extensions are not supported in headless Chromium yet):

```bash
npm run test:e2e
```

To run all unit + e2e tests together:

```bash
npm run test:all
```

Notes / Limitations:

- The actual selection of the native Chrome context menu item cannot be automated; the test simulates the final effect.
- Opening a `vscode://` URL is intercepted (stubbed) so no external application is launched.
- Network access to github.com is required.
- If running in CI without network, you can set `CI_OFFLINE=1` to skip the e2e test.

## License

Licensed under the [MIT License](https://github.com/aberonni/open-in-vscode/blob/master/LICENSE).
