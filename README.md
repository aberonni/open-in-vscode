# Open in VSCode

> Open links to source code in VSCode.

![Screenshot](screenshot.png)

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

## All I see is a blank page!

This could be happening for numerous reasons. Make sure you have set the options correctly in the options page.
If you want, you can check what URL the extension is trying to open by enabling the debug mode in the options.
You might want to [check out how VSCode handles links](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls).

## Feedback

If you are having any issues, or would like to request a new feature, don't hesitate to [open an issue on github](https://github.com/aberonni/open-in-vscode/issues)!

## License

Licensed under the [MIT License](https://github.com/aberonni/open-in-vscode/blob/master/LICENSE).
