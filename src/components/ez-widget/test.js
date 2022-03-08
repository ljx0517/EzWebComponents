function extractVarsFromObject(obj, str) {
  const ks = Object.keys(obj).filter(k => {
    // return typeof obj[k] != 'function' && typeof obj[k] != 'object'
    return obj[k].constructor.name != 'Object';
  })
  // const re = new RegExp(`\\b(?:${ks.join('|')})\\b`.replaceAll('.', `\\.`), 'g')
  console.log(`\\b(?:${ks.join('|')})\\b`.replace(/\./, `\\.`));
  const re = new RegExp(`\\b(?:${ks.join('|')})\\b`.replace(/\./, `\\.`), 'g')
  return str.match(re) || []
}
const res = extractVarsFromObject({
  numbers: [1,2]
}, "{numbers.join(' + ')}")
console.log(res);

