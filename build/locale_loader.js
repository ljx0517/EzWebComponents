const path = require('path');

function getLocaleCode(name, code) {
  return `${code.replace('export default', 'const message =')}
if (window && window.x && window.x.spreadsheet) {
  window.__ec__.ezcel.$messages = window.__ec__.ezcel.$messages || {};
  window.__ec__.ezcel.$messages['${name}'] = message;
}
export default message;
`;
}

module.exports = require('babel-loader').custom(babel => {
  return {
    result(result, { options }) {
      // console.log('options:', options);
      const lang = path.basename(options.filename, '.js');
      result.code = getLocaleCode(lang, result.code);
      return result;
    },
  };
});
