class Node{
  constructor(id) {
    this.id = id
    this.beforeId = null;
    this.updated = false;
  }
  update(id) {
    this.beforeId = this.id;
    this.id = id;
    this.updated = true
  }
}
const key = 'id'
const old_blocks = [{"id":1,"name":"apple"},{"id":2,"name":"banana"},{"id":3,"name":"carrot"},{"id":4,"name":"doughnut"},{"id":5,"name":"egg"}] //[ {index: 0, item: 1, key: 'o1'},  {index: 1, item: 3, key: 'o3'}]
const list = [{"id":2,"name":"banana"},{"id":3,"name":"carrot"},{"id":4,"name":"doughnut"},{"id":5,"name":"egg"}] //  {index: 0, item: 1, key: 'o1'}, {index: 0, item: 2, key: 'n2'},  {index: 1, item: 4, key: 'n4'}]
patchItems(old_blocks, list, key)
function patchItems(old_blocks, list, keyName) {
  let o = old_blocks.length;
  let n = list.length;
  const old_indexes = {}
  let i = o;
  while (i--) {
    old_indexes[old_blocks[i][keyName]] = i;
  }
  console.log(old_indexes)

  const lookup = new Map()
  old_blocks.forEach(b => {
    // lookup.set(b[key], new Node(b.key))
    lookup.set(b[keyName], b)
  })

  const new_blocks = [];
  const new_lookup = new Map();
  const deltas = new Map();
  i = n
  while (i--) {
    const key = list[i][keyName];
    let block = lookup.get(key);
    // 这个block 应该对节点操作了?
    if (!block) { // 新node, create it
      // block = create_each_block(key, child_ctx);
      // block.c();
      console.log('create', key);
      block = new Node(key)
    } else { // is old, only update it
      // block.p(child_ctx, dirty);
      // block.update(key)
      console.log('update', key);
    }
    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes)
      deltas.set(key, Math.abs(i - old_indexes[key]));
  }
  let next = null;
  const will_move = new Set();
  const did_move = new Set();
  const destroy = (block, lookup) => {
    lookup.delete(block.___uniqueItemKey);
    // block.detach
    console.log('destory', block, lookup )
  }
  function insert(block) {
    console.log('insert', next? 'prev' : 'append', block)
    // transition_in(block, 1); // ?
    // block.m(node, next); // mount node
    lookup.set(block.id, block);
    // next = block.first; // 这个next 应该是插入node的位置
    next = block; // 这个next 应该是插入node的位置
    n--;
  }

  while (o && n) {
    const new_block = new_blocks[n - 1];
    const old_block = old_blocks[o - 1];
    const new_key = new_block.id;
    const old_key = old_block.key;
    if (new_block === old_block) {
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      // remove old block
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }
  while (o--) {
    const old_block = old_blocks[o];
    if (!new_lookup.has(old_block[keyName])) {
      // destroy(old_block, lookup);
      destroy(old_block, lookup);
    }
  }
  while (n) {
    insert(new_blocks[n - 1]);
  }
}
