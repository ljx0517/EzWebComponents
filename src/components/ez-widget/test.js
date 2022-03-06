const state = {
  a: 1,
  b: 2,
  user: {
    name: 'username',
    age: 'userage'
  },
  'user.name': 'username',
  'user.age': 'userage',

}
const exp = `{ a + b + user.name + abc}`
const ks = Object.keys(state).filter(k => {
  return typeof state[k] != 'function' && typeof state[k] != 'object'
})
const aa = new RegExp(`\\b(?:${ks.join('|')})\\b`.replaceAll('.', `\\.`), 'g')
console.log(aa)
console.log(exp)
const res =exp.match(aa)
console.log(1, res)
