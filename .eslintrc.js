module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'space-before-function-paren': 0,
		'no-tabs': 0,
		'vue/no-unused-vars': 0,
		'no-trailing-spaces': 0,
		'indent': 0,
		'no-mixed-spaces-and-tabs': 0,
		'no-useless-return': 0,
		'padded-blocks': 0,
		'no-unused-vars': 0,
		'keyword-spacing': 0
  }
}
