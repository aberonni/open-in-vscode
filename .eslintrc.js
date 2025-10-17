module.exports = {
  root: true,
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    indent: ['error', 2],
    'no-alert': 'off', // alerts used intentionally for UX feedback
  },
  overrides: [
    {
      files: ['**/tests/**/*.js'],
      env: { jest: true, node: true },
    },
    {
      files: ['tests-e2e/**/*.js'],
      env: { node: true, browser: true },
      rules: {
        'max-len': ['off'], // relax for test commentary
        'no-underscore-dangle': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['**/src/**/*.js'],
      env: { browser: true, serviceworker: true },
      globals: {
        chrome: 'readonly',
      },
    },
  ],
};
