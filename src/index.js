const yargs = require('yargs');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const args = {
  SRC: 'src',
  LOCALES: 'locales',
  MULTI_FILES: 'multi-files',
  SINGLE_FILE: 'single-file',
};

const { argv } = yargs
  .string(args.SRC)
  .default(args.SRC, '.source_strings.json')
  .describe(args.SRC, 'Path to source.')
  .string(args.LOCALES)
  .default(args.LOCALES, 'src/i18n/locales')
  .describe(args.LOCALES, 'Path to locale object / module.')
  .string(args.MULTI_FILES)
  .default(args.MULTI_FILES, null)
  .describe(
    args.MULTI_FILES,
    'Folder path (relative to root) where multi file translations will be stored. If omitted a single file will be created / used.',
  )
  .string(args.SINGLE_FILE)
  .default(args.SINGLE_FILE, 'translation_input.json')
  .describe(args.SINGLE_FILE, 'File path when using single translation file.');

const safeRequire = modulePath => {
  try {
    // eslint-disable-next-line global-require
    return require(modulePath);
  } catch {
    return false;
  }
};

const sourceStrings = safeRequire(path.join(process.cwd(), argv[args.SRC]));
assert(
  sourceStrings,
  'Could not find source (defaults to .source_string.json).',
);

const { phrases } = sourceStrings;

const hashToTexts = phrases.reduce(
  (acc, phrase) => ({ ...acc, ...(phrase.hashToText || {}) }),
  {},
);

const locales = Object.keys(
  safeRequire(path.join(process.cwd(), argv[args.LOCALES])) || {
    en_US: {},
  },
);

// OPEN POINT: Should we update translation when the locale is "en_US" (default)?
const updateTranslations = translations => {
  const hashesToAdd = Object.keys(hashToTexts || []).filter(
    hash => !Object.keys(translations).includes(hash),
  );
  const hashesToRemove = Object.keys(translations || []).filter(
    hash => !Object.keys(hashToTexts).includes(hash),
  );

  const updatedTranslations = { ...translations };
  hashesToAdd.forEach(hash => {
    if (!updatedTranslations[hash]) {
      updatedTranslations[hash] = {
        translations: [{ translation: hashToTexts[hash] }],
      };
    }
  });
  hashesToRemove.forEach(hash => {
    if (updatedTranslations[hash]) {
      delete updatedTranslations[hash];
    }
  });

  return updatedTranslations;
};

if (argv[args.MULTI_FILES]) {
  locales.forEach(locale => {
    const translationsFilePath = path.join(
      process.cwd(),
      argv[args.MULTI_FILES],
      `${locale}.json`,
    );
    const translationsObj = safeRequire(translationsFilePath) || {
      'fb-locale': locale,
      translations: {},
    };
    translationsObj.translations = updateTranslations(
      translationsObj.translations,
    );
    fs.writeFileSync(
      translationsFilePath,
      JSON.stringify(translationsObj, null, 2),
    );
  });
} else {
  const translationsFilePath = path.join(process.cwd(), argv[args.SINGLE_FILE]);
  const translationsObj = safeRequire(translationsFilePath) || {
    phrases: [],
    translationGroups: [],
  };

  // Update phrases
  // OPEN POINT: Are there cases where we don't want to just replace phrases with those from source
  translationsObj.phrases = phrases;

  // Update translations for each locale
  locales.forEach(locale => {
    const localeMatch = group => group['fb-locale'] === locale;
    const translationsForLocaleObj = translationsObj.translationGroups.find(
      localeMatch,
    ) || {
      'fb-locale': locale,
      translations: {},
    };
    translationsForLocaleObj.translations = updateTranslations(
      translationsForLocaleObj.translations,
    );
    if (translationsObj.translationGroups.findIndex(localeMatch) === -1) {
      translationsObj.translationGroups.push(translationsForLocaleObj);
    }
  });

  fs.writeFileSync(
    translationsFilePath,
    JSON.stringify(translationsObj, null, 2),
  );
}
