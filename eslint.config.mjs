import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // 無視するファイル
  {
    ignores: [
      '**/node_modules/**',
      '**/out/**',
      '**/dist/**',
      '**/*.luau',
      '**/*.lua',
    ],
  },

  // ESLint推奨ルール
  eslint.configs.recommended,

  // TypeScript ESLint推奨ルール
  ...tseslint.configs.recommended,

  // Prettier連携
  eslintPluginPrettier,

  // カスタムルール
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // roblox-ts特有の設定
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // コード品質
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],

      // Prettier
      'prettier/prettier': 'warn',
    },
  },
);
