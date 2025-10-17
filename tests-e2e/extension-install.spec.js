// Integration test: verify extension loads, options can be saved, and a vscode:// link is generated intent-like.
// We can't (in automation) click the real Chrome native context menu item nor launch VSCode.
// Strategy: install extension, set options, navigate to repo, right-click a file-related element, then simulate
// what the background script would do and assert the window.open argument (captured by a stub) matches expectation.
import { test, expect } from './fixtures';

// Minimal GitHub file URL for this repository to exercise parseLink.
const SAMPLE_FILE_PATH = '.editorconfig';
const fakeBasePath = '/Users/test/git';

// Build the expected vscode URL builder (mirrors getVscodeLink logic for test expectation)
function buildExpectedUrl({
  basePath,
  repo,
  file,
  insidersBuild = false,
  remoteHost = '',
  line,
  isFolder = false,
}) {
  let vscodeLink = insidersBuild ? 'vscode-insiders' : 'vscode';
  vscodeLink += remoteHost ? `://vscode-remote/ssh-remote+${remoteHost}` : '://file';
  if (basePath[0] !== '/') vscodeLink += '/';
  vscodeLink += `${basePath}/${repo}/${file}`;
  if (isFolder) vscodeLink += '/';
  if (line) vscodeLink += `:${line}:1`;
  return vscodeLink;
}

// Mark: Main test
// We use https://github.com/aberonni/open-in-vscode as the page under test.
test('extension installs and builds vscode link via simulated context menu action', async ({ context, extensionId }) => {
  expect(extensionId).toBeTruthy();

  // Stub window.open to capture URL attempts
  await context.addInitScript(() => {
    window.openedLinks = [];
    const original = window.open;
    // eslint-disable-next-line no-undef
    window.open = function patched(url, ...rest) { window.openedLinks.push(url); return original.call(this, 'about:blank', ...rest); };
  });

  // Open options page and configure minimal required basePath.
  const optionsPage = await context.newPage();
  await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
  await optionsPage.fill('#basePath', fakeBasePath);
  await optionsPage.click('text=Save settings');
  await expect(optionsPage.locator('.alert')).toHaveClass(/show/);

  // Navigate to repo
  const page = await context.newPage();
  await page.goto('https://github.com/aberonni/open-in-vscode');

  // Open file
  const fileLink = await page.getByRole('link', { name: SAMPLE_FILE_PATH });
  await fileLink.click();
  await page.getByRole('heading', { name: SAMPLE_FILE_PATH }).isVisible();

  // Simulate clicking on extension in active tab
  const extWorker = context.serviceWorkers().find((sw) => sw.url().includes(extensionId));
  await extWorker.evaluate(() => {
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true }, (tabs) => {
      // eslint-disable-next-line no-undef
      chrome.action.onClicked.dispatch(tabs[0]);
    });
  });

  // Assert expected vscode link was opened
  // Limitation: cannot programmatically choose the native context menu entry, so we simulate the final effect.
  const expected = buildExpectedUrl({ basePath: fakeBasePath, repo: 'open-in-vscode', file: SAMPLE_FILE_PATH });
  // Assert captured window.open call contains expected vscode link.
  const opened = await page.evaluate(() => window.openedLinks);
  console.log(opened);
  expect(opened.some((u) => u === expected)).toBeTruthy();

  await context.close();
});
