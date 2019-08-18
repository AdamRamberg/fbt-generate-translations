# 💬 fbt-generate-translations

Generates translations from collected translations (collectFbt.js) to a format that FBT's translate script expects.

## What does it do?

Should be run before `yarn collect-fbts` and after `yarn translate-fbts`. It creates translations from the output of `yarn collect-fbts` that are consumable by `yarn translate-fbts`. If it finds a new hash from the collected translations it adds it to the generated translations and if it doesn't find a hash in the collected translations that are in the generated translations it removes it from the generated translations. This process is otherwise manual using fbt.

## Prerequisites

You need to setup [`fbt`](https://github.com/facebookincubator/fbt) before adding this package to your project.

## Installation

Using yarn:

```
yarn add fbt-generate-translations --dev
```

Using npm:

```
npm install fbt-generate-translations --save-dev
```

## Usage

Add it to the `scripts` section of your `package.json`:
`"fbt-generate-translations": "node node_modules/fbt-generate-translations/index`

Then run: `yarn fbt-generate-translations`

## Options

- **src** - Path to the source (from collectFbt). Defaults to `.source_strings.json`.

  Example: `node node_modules/fbt-generate-translations/index --src custom_src_name.json`

- **locales** - Path to locale object / module (cjs). Defaults to `{ en_US: {} }`. Should follow the locales format provided in the [fbt demo](https://github.com/facebookincubator/fbt/blob/master/demo-app/src/example/Example.react.js).

  Example: `node node_modules/fbt-generate-translations/index --src src/i18n/locales.js`

- **multi-files** - Folder path (relative to root) where multi file translations will be stored. If omitted a single file will be generated.

  Example: `node node_modules/fbt-generate-translations/index --multi-files translations`

- **single-file** - File path when using single translation file. Defaults to `translation_input.json`.

  Example: `node node_modules/fbt-generate-translations/index --single-file custom_translations_file_name.json`
