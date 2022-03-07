// const path = require('path');
import path, { dirname } from 'path'
export default function customCssModuleLoader(source) {
  // return source;
  // console.log(module.i);
  source = source.replace('module.exports = ___CSS_LOADER_EXPORT___;', '')
  source = source + '// if(!module.i || !module.i.endsWith(".module.less")){\n' +
    '   // return module.exports = exports;\n' +
    '// } else {\n'+
    '   ___CSS_LOADER_EXPORT___ = new Proxy(___CSS_LOADER_EXPORT___, {\n' +
    '        get: function(target, prop, receiver) {\n' +
    '          // console.log(prop, target);\n' +
    '          if (prop in target) {\n' +
    '             return target[prop];\n' +
    '          }\n' +
    '          if (target.locals && prop in target.locals) {\n' +
    '            return target.locals[prop];    \n' +
    '          }\n' +
    '          return Reflect.get(...arguments);;\n' +
    '        },\n' +
    '   });\n' +
    '   module.exports = ___CSS_LOADER_EXPORT___;\n' +
    '// }\n'
  return source;
}
/*
module.exports = require('babel-loader').custom(babel => {
  return {
    result(result, { options }) {
      // console.log('options:', options);
      console.log('result:', result);
      // result.toString = () => {
      //   result
      // }
      // return result;
      return new Proxy(result, {
        get: function(target, prop, receiver) {
          console.log(target);
          return target[prop];
        },
        // set: function(obj, prop, value) {
        //   if (prop === 'age') {
        //     if (!Number.isInteger(value)) {
        //       throw new TypeError('The age is not an integer');
        //     }
        //     if (value > 200) {
        //       throw new RangeError('The age seems invalid');
        //     }
        //   }
      })

    },
  };
});
*/
