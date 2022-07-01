module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:import/recommended',
		'plugin:import/typescript',
		'airbnb-typescript/base',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier'
	],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs', '*.config.js'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		project: [
			'tsconfig.json'
		]
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
