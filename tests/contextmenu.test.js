const { getVscodeLink, parseLink } = require('../src/contextmenu');

// Pure functions under test; chrome APIs are guarded in module and don't need mocking here.

describe('getVscodeLink basics', () => {
  it('builds a vscode-insiders remote link with line number', () => {
    const link = getVscodeLink({
      repo: 'my-repo', file: 'path/to/file.js', isFolder: false, line: '10',
    }, {
      remoteHost: 'my-host', insidersBuild: true, basePath: '/home/user/projects', debug: false,
    });
    expect(link).toBe('vscode-insiders://vscode-remote/ssh-remote+my-host/home/user/projects/my-repo/path/to/file.js:10:1');
  });

  it('adds trailing slash when folder', () => {
    const link = getVscodeLink({ repo: 'repo', file: 'dir', isFolder: true }, {
      remoteHost: '', insidersBuild: false, basePath: '/root', debug: false,
    });
    expect(link).toBe('vscode://file/root/repo/dir/');
  });
});

describe('parseLink', () => {
  it('parses a blob url with line number', () => {
    const parsed = parseLink('https://github.com/user/repo/blob/main/src/index.js#L42');
    expect(parsed).toEqual({
      repo: 'repo', file: 'src/index.js', isFolder: false, line: '42',
    });
  });

  it('parses a tree url (folder)', () => {
    const parsed = parseLink('https://github.com/user/repo/tree/main/src');
    expect(parsed).toEqual({
      repo: 'repo', file: 'src', isFolder: true, line: undefined,
    });
  });

  it('throws on invalid link', () => {
    expect(() => parseLink('https://github.com/user/repo/invalid/path')).toThrow(/Invalid link/);
  });
});

// Exhaustive mapping for local (non-remote) scenarios covering:
// - top-level file
// - nested file
// - nested file with line anchor
// - deep nested file
// - folder (tree)
// - dot-folder file
// - hidden file (.gitignore style)
// - file with test naming convention
// Each key is a GitHub URL; value is the expected VSCode URL opened by the extension.
describe('exhaustive local & PR & GitLab link mapping', () => {
  const options = {
    remoteHost: '',
    insidersBuild: false,
    basePath: '/workspace',
    debug: false,
  };
  const expectedMapping = {
    // GitHub file URLs
    'https://github.com/aberonni/open-in-vscode/blob/master/README.md': 'vscode://file/workspace/open-in-vscode/README.md',
    'https://github.com/aberonni/open-in-vscode/blob/master/src/contextmenu.js#L10': 'vscode://file/workspace/open-in-vscode/src/contextmenu.js:10:1',
    'https://github.com/aberonni/open-in-vscode/tree/master/src/icons': 'vscode://file/workspace/open-in-vscode/src/icons/',
    // GitHub PR diff links (selectionText required)
    'https://github.com/aberonni/open-in-vscode/pull/123/files#diff-contextmenu': 'vscode://file/workspace/open-in-vscode/src/contextmenu.js',
    'https://github.com/aberonni/open-in-vscode/pull/123/files#diff-options': 'vscode://file/workspace/open-in-vscode/src/options.js',
    // GitLab style links
    'https://gitlab.com/gitlab-org/gitlab/-/blob/master/README.md': 'vscode://file/workspace/gitlab/README.md',
    'https://gitlab.com/gitlab-org/gitlab/-/blob/master/README.md?ref_type=heads#L7': 'vscode://file/workspace/gitlab/README.md:7:1',
    // Gitlab PR diff links (selectionText required)
    'https://gitlab.com/gitlab-org/gitlab/-/merge_requests/209255/diffs': 'vscode://file/workspace/gitlab/package.json',
  };
  const selectionTextForLink = {
    'https://github.com/aberonni/open-in-vscode/pull/123/files#diff-contextmenu': 'src/contextmenu.js',
    'https://github.com/aberonni/open-in-vscode/pull/123/files#diff-options': 'src/options.js',
    'https://gitlab.com/gitlab-org/gitlab/-/merge_requests/209255/diffs': 'package.json',
  };
  it('generates mapping identical to expectedMapping', () => {
    const generated = Object.fromEntries(Object.keys(expectedMapping).map((link) => {
      const sel = selectionTextForLink[link];
      const parsed = sel ? parseLink(link, sel, link) : parseLink(link);
      return [link, getVscodeLink(parsed, options)];
    }));
    expect(generated).toEqual(expectedMapping);
  });
});
