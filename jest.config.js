// import type {Config} from '@jest/types';

export default {
  verbose: true,
  preset: 'ts-jest',
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/jest/fileTransformer.js",
    "\\.(css|less)$": "identity-obj-proxy"
  },
  "transform": {
    "^.+\\.[t|j]sx?$": "babel-jest"
    // "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/jest/babelTransformImportExport.js",
    // "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/fileTransformer.js"
  },
  // moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
  testTimeout: 20000,
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['node_modules', 'src/database', 'src/test', 'src/types'],
  reporters: ['default', 'jest-junit'],
  globals: { 'ts-jest': { diagnostics: false } },
  // testURL: "http://localhost/",

  // testMatch: [ '**/*.test.mjs' ]
  // testMatch: ['**/__tests__/*.js?(m)'],
  "testMatch": [
    "<rootDir>/test/**/*.(test).{js,mjs, jsx,ts,tsx}",
    "<rootDir>/test/**/?(*.)(spec|test).{js, mjs,jsx,ts,tsx}"
  ],
};
