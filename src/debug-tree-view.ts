type DATA_TYPE = "null"|"array"|"undefined"|"object"|"boolean"|"number"|"bigint"|"string"|"symbol"|"function"|"object"
type DOM_TYPE = {
  container: HTMLDivElement;
  spacing: HTMLDivElement;
  children: HTMLDivElement;
  collapseExpand: HTMLDivElement;
  name: HTMLDivElement;
  // insert: HTMLDivElement;
  separator: HTMLDivElement;
  value: HTMLDivElement;
  // delete: HTMLDivElement
};

export class JSONTreeView extends EventTarget{

  isRoot = true;
  _readonly= 0;
  _parent: JSONTreeView = null;
  _children: JSONTreeView[] = [];
  _readonlyWhenFiltering = true;
  _hidden = false;
  _showCount = 1
  name = ''
   type: DATA_TYPE;
  oldType: DATA_TYPE;
  _value: any = null;
  domEventListeners : {element : HTMLElement, name : string, fn : (...args: any) => void}[] = []
  expanded = false
  withRootName=true


  _dom: DOM_TYPE
  constructor(name: any, value?: any, parent:JSONTreeView=null, isRoot=true){
    super();
    this._parent  =parent;
    this.isRoot = isRoot;
    this._dom = {
      container : document.createElement('div'),
      collapseExpand : document.createElement('div'),
      name : document.createElement('div'),
      separator : document.createElement('div'),
      value : document.createElement('div'),
      spacing: document.createElement('div'),
      // delete : document.createElement('div'),
      children : document.createElement('div'),
      // insert : document.createElement('div')
    };

    if(arguments.length < 2){
      value = name;
      name = undefined;
    }
    this.init();
    this.setName(name);
    this.value = value;

  }
  get dom () {
    return this._dom.container
  }
  get children() {
    let result:any = null;
    if (this.type === 'array') {
      result = this._children;
    }
    else if (this.type === 'object') {
      result = {};
      this._children.forEach(function(e) {
        result[e.name] = e;
      });
    }
    return result;
  }

  get readonly () : boolean{
    return !!(this._readonly & 1);
  }
  set readonly(ro) {
    this._readonly = this.setBit(this._readonly, 0, +ro);
    if(this._readonly & 1){
      this._dom.container.classList.add('readonly')
    } else {
      this._dom.container.classList.remove('readonly');
    }
    for (const i in this._children) {
      if (typeof this._children[i] === 'object') {
        this._children[i]._readonly = this.setBit(this._readonly, 0, +ro);
      }
    }
  }

  get hidden() {
    return this._hidden;
  }
  set hidden(h) {
    this._hidden = h;
    h ? this._dom.container.classList.add('hidden')
        : this._dom.container.classList.remove('hidden');
    if (!h) {
      this._parent && (this._parent.hidden = h);
    }
  }
  get showCountOfObjectOrArray() {
    return this._showCount;
  }
  set showCountOfObjectOrArray(show) {
    this._showCount = show;
    for (const i in this._children) {
      if (typeof this._children[i] === 'object') {
        this._children[i].showCountOfObjectOrArray = show;
      }
    }
    (this.type === 'object' || this.type === 'array') && this.updateObjectChildCount();
  }

  init() {
    Object.keys(this._dom).forEach((k: keyof DOM_TYPE) => {

      // if (k === 'delete' && this.isRoot) {
      //   return;
      // }
      const element = this._dom[k];

      if(k == 'container'){
        return;
      }

      element.className = k;
      if (['name', 'separator', 'value', 'spacing'].indexOf(k) > -1) {
        element.className += ' item';
      }
      this._dom.container.appendChild(element);
    });

    this._dom.container.className = 'jsonView';

    this.addDomEventListener(this._dom.collapseExpand, 'click', this.onCollapseExpandClick);
    this.addDomEventListener(this._dom.value, 'click', this.expand.bind(null, false));
    this.addDomEventListener(this._dom.name, 'click', this.expand.bind(null, false));

    // addDomEventListener(this._dom.name, 'dblclick', editField.bind(null, 'name'));
    // addDomEventListener(this._dom.name, 'click', itemClicked.bind(null, 'name'));
    // addDomEventListener(this._dom.name, 'blur', editFieldStop.bind(null, 'name'));
    // addDomEventListener(this._dom.name, 'keypress',
    //     editFieldKeyPressed.bind(null, 'name'));
    // addDomEventListener(this._dom.name, 'keydown',
    //     editFieldTabPressed.bind(null, 'name'));

    // addDomEventListener(this._dom.value, 'dblclick', editField.bind(null, 'value'));
    // addDomEventListener(this._dom.value, 'click', itemClicked.bind(null, 'value'));
    // addDomEventListener(this._dom.value, 'blur', editFieldStop.bind(null, 'value'));
    // addDomEventListener(this._dom.value, 'keypress',
    //     editFieldKeyPressed.bind(null, 'value'));
    // addDomEventListener(this._dom.value, 'keydown',
    //     editFieldTabPressed.bind(null, 'value'));
    // addDomEventListener(this._dom.value, 'keydown', numericValueKeyDown);

    // addDomEventListener(this._dom.insert, 'click', onInsertClick);
    // addDomEventListener(this._dom.delete, 'click', onDeleteClick);
  }










  // setName(name_);
  // setValue(value_);

  setBit = (n: number, i: number, b: number) => {
    let j = 0;
    while ((n >> j << j)) {
      j++;
    }
    return i >= j
        ? (n | +b << i )
        : (n >> (i + 1) << (i + 1)) | (n % (n >> i << i)) | (+b << i);
  }


  // squarebracketify = (exp) => {
  //   return typeof exp === 'string'
  //       ? exp.replace(/\.([0-9]+)/g, '[$1]') : exp + '';
  // }

  refresh(silent = true){
    const expandable = this.type == 'object' || this.type == 'array';

    this._children.forEach(function(child){
      child.refresh(true);
    });

    this._dom.collapseExpand.style.display = expandable ? '' : 'none';

    if(this.expanded && expandable){
      this.expand(false, silent);
    }
    else{
      this.collapse(false, silent);
    }
    if (!silent) {
      this.emit('refresh', this, [this.name], this.value);
    }
  }


  collapse(recursive=false, silent=true){
    if(recursive){
      this._children.forEach(function(child){
        child.collapse(true, true);
      });
    }

    this.expanded = false;

    this._dom.children.style.display = 'none';
    this._dom.collapseExpand.className = 'expand';
    this._dom.container.classList.add('collapsed');
    this._dom.container.classList.remove('expanded');
    // if (!silent && (type == 'object' || type == 'array')) {
    //   self.emit('collapse', self, [self.name], self.value);
    // }
  }


  expand = (recursive=false, silent=false) => {
    let keys;

    if(this.type == 'object'){
      keys = Object.keys(this.value);
    }
    else if(this.type == 'array'){
      keys = this._value.map((v: any, k: any) => {
        return k;
      });
    }
    else{
      keys = [];
    }

    // Remove children that no longer exist
    for(let i = this._children.length - 1; i >= 0; i --){
      const child = this._children[i];
      if (!child) {
        break;
      }
      if(keys.indexOf(child.name) == -1){
        this._children.splice(i, 1);
        this.removeChild(child);
      }
    }

    if(this.type != 'object' && this.type != 'array'){
      return this.collapse();
    }

    keys.forEach((key: string) => {
      this.addChild(key, this.value[key]);
    });

    if(recursive){
      this._children.forEach(function(child){
        child.expand(true, true);
      });
    }

    this.expanded = true;
    this._dom.children.style.display = '';
    this._dom.collapseExpand.className = 'collapse';
    this._dom.container.classList.add('expanded');
    this._dom.container.classList.remove('collapsed');
    // if (!silent && (type == 'object' || type == 'array')) {
    //   self.emit('expand', self, [self.name], self.value);
    // }
  }


  destroy(){

    let event = this.domEventListeners.pop()

    while(event){
      event.element.removeEventListener(event.name, event.fn);
      event = this.domEventListeners.pop()
    }
    let child = this._children.pop();
    while(child){
      this.removeChild(child);
      child = this._children.pop();
    }
  }


  setName(newName: string){
    const nameType = typeof newName
    const oldName = this.name;
    if (typeof newName == "undefined") {
      this._dom['separator'].classList.add('hidden')
      return;
    }

    if(newName === this.name){
      return;
    }

    if(nameType != 'string' && nameType != 'number'){
      throw new Error('Name must be either string or number, ' + newName);
    }

    this._dom.name.innerText = newName;
    this.name = newName;
    this.emit('rename', this, [this.name], oldName, newName, true);
  }

  get value() {
    return this._value;
  }
  set value (newValue){
    let oldValue = this.value;
    let str;
    let len;

    if (this.isRoot && !oldValue) {
      oldValue = newValue;
    }
    this.type = this.getType(newValue);
    const oldType = oldValue ? this.getType(oldValue) : this.type;

    switch(this.type){
      case 'null':
        str = 'null';
        break;
      case 'undefined':
        str = 'undefined';
        break;
      case 'object':
        len = Object.keys(newValue).length;
        str = this._showCount ? 'Object[' + len + ']' : (len < 1 ? '{}' : '');
        break;

      case 'array':
        len = newValue.length;
        str = this._showCount ? 'Array[' + len + ']' : (len < 1 ? '[]' : '');
        break;

      default:
        str = newValue;
        break;
    }

    this._dom.value.innerText = str;
    this._dom.value.className = 'value item ' + this.type;

    if(newValue === this._value){
      return;
    }

    this._value = newValue;

    if(this.type == 'array' || this.type == 'object'){
      // Cannot edit objects as string because the formatting is too messy
      // Would have to either pass as JSON and force user to wrap properties in quotes
      // Or first JSON stringify the input before passing, this could allow users to reference globals

      // Instead the user can modify individual properties, or just delete the object and start again
      // valueEditable = false;

      if(this.type == 'array'){
        // Obviously cannot modify array keys
        // nameEditable = false;
      }
    }

    // self.emit('change', self, [name], oldValue, newValue);
    this.refresh();
  }


  updateObjectChildCount() {
    let str = ''
    let len;
    if (this.type === 'object') {
      len = Object.keys(this.value).length;
      str = this._showCount ? 'Object[' + len + ']' : (len < 1 ? '{}' : '');
    }
    if (this.type === 'array') {
      len = this.value.length;
      str = this._showCount ? 'Array[' + len + ']' : (len < 1 ? '[]' : '');
    }
    this._dom.value.innerText = str;
  }


  addChild(key: string, val: any){
    let child;

    for(let i = 0, len = this._children.length; i < len; i ++){
      if(this._children[i].name == key){
        child = this._children[i];
        break;
      }
    }

    if(child){
      child.value = val;
    }
    else{
      child = new JSONTreeView(key, val, this, false);
      child._dom.container.classList.add('sub')
      // child.on('rename', this.onChildRename);
      // child.on('delete', onChildDelete);
      // child.on('change', onChildChange);
      // child.on('append', onChildAppend);
      child.on('click', this.onChildClick);
      child.on('expand', this.onChildExpand);
      child.on('collapse', this.onChildCollapse);
      child.on('refresh', this.onChildRefresh);
      this._children.push(child);
      child.emit('append', child, [key], 'value', val, true);
    }

    this._dom.children.appendChild(child.dom);

    return child;
  }


   removeChild(child: JSONTreeView){
    if(child._dom.container.parentNode){
      this._dom.children.removeChild(child.dom);
    }

    child.destroy();
    // child.emit('delete', child, [child.name], child.value,
    //     (child._parent && child._parent.isRoot) ? child._parent.oldType : child._parent.type, true);
    // child.removeAllListeners();
  }


  //  editField(field){
  //   if((readonly > 0 && filterText) || !!(readonly & 1)) {
  //     return;
  //   }
  //   if(field === 'value' && (type === 'object' || type === 'array')){
  //     return;
  //   }
  //   if(parent_ && parent_.type == 'array'){
  //     // Obviously cannot modify array keys
  //     nameEditable = false;
  //   }
  //   var editable = field == 'name' ? nameEditable : valueEditable,
  //       element = dom[field];
  //
  //   if(!editable && (parent_ && parent_.type === 'array')){
  //     if (!parent_.inserting) {
  //       // throw new Error('Cannot edit an array index.');
  //       return;
  //     }
  //   }
  //
  //   if(field == 'value' && type == 'string'){
  //     element.innerText = '"' + value + '"';
  //   }
  //
  //   if(field == 'name'){
  //     edittingName = true;
  //   }
  //
  //   if(field == 'value'){
  //     edittingValue = true;
  //   }
  //
  //   element.classList.add('edit');
  //   element.setAttribute('contenteditable', true);
  //   element.focus();
  //   document.execCommand('selectAll', false, null);
  // }


  // function itemClicked(field) {
  //   self.emit('click', self,
  //       !self.withRootName && self.isRoot ? [''] : [self.name], self.value);
  // }


  //  editFieldStop(field){
  //   var element = dom[field];
  //
  //   if(field == 'name'){
  //     if(!edittingName){
  //       return;
  //     }
  //     edittingName = false;
  //   }
  //
  //   if(field == 'value'){
  //     if(!edittingValue){
  //       return;
  //     }
  //     edittingValue = false;
  //   }
  //
  //   if(field == 'name'){
  //     var p = self.parent;
  //     var edittingNameText = element.innerText;
  //     if (p && p.type === 'object' && edittingNameText in p.value) {
  //       element.innerText = name;
  //       element.classList.remove('edit');
  //       element.removeAttribute('contenteditable');
  //       // throw new Error('Name exist, ' + edittingNameText);
  //     }
  //     else {
  //       setName.call(self, edittingNameText);
  //     }
  //   }
  //   else{
  //     var text = element.innerText;
  //     try{
  //       setValue(text === 'undefined' ? undefined : JSON.parse(text));
  //     }
  //     catch(err){
  //       setValue(text);
  //     }
  //   }
  //
  //   element.classList.remove('edit');
  //   element.removeAttribute('contenteditable');
  // }


  // function editFieldKeyPressed(field, e){
  //   switch(e.key){
  //     case 'Escape':
  //     case 'Enter':
  //       editFieldStop(field);
  //       break;
  //   }
  // }


  // function editFieldTabPressed(field, e){
  //   if(e.key == 'Tab'){
  //     editFieldStop(field);
  //
  //     if(field == 'name'){
  //       e.preventDefault();
  //       editField('value');
  //     }
  //     else{
  //       editFieldStop(field);
  //     }
  //   }
  // }


  // function numericValueKeyDown(e){
  //   var increment = 0, currentValue;
  //
  //   if(type != 'number'){
  //     return;
  //   }
  //
  //   switch(e.key){
  //     case 'ArrowDown':
  //     case 'Down':
  //       increment = -1;
  //       break;
  //
  //     case 'ArrowUp':
  //     case 'Up':
  //       increment = 1;
  //       break;
  //   }
  //
  //   if(e.shiftKey){
  //     increment *= 10;
  //   }
  //
  //   if(e.ctrlKey || e.metaKey){
  //     increment /= 10;
  //   }
  //
  //   if(increment){
  //     currentValue = parseFloat(dom.value.innerText);
  //
  //     if(!isNaN(currentValue)){
  //       setValue(Number((currentValue + increment).toFixed(10)));
  //     }
  //   }
  // }


  getType(value: any): DATA_TYPE{
    const type = typeof value;

    if(type == 'object'){
      if(value === null){
        return 'null';
      }

      if(Array.isArray(value)){
        return 'array';
      }
    }
    if (type === 'undefined') {
      return 'undefined';
    }

    return type;
  }


  onCollapseExpandClick = () => {
    if(this.expanded){
      this.collapse();
    }
    else{
      this.expand();
    }
  }


  // function onInsertClick(){
  //   var newName = type == 'array' ? value.length : undefined,
  //       child = addChild(newName, null);
  //   if (child.parent) {
  //     child.parent.inserting = true;
  //   }
  //   if(type == 'array'){
  //     value.push(null);
  //     child.editValue();
  //     child.emit('append', self, [value.length - 1], 'value', null, true);
  //     if (child.parent) {
  //       child.parent.inserting = false;
  //     }
  //   }
  //   else{
  //     child.editName();
  //   }
  // }


  // function onDeleteClick(){
  //   self.emit('delete', self, [self.name], self.value,
  //       self.parent.isRoot ? self.parent.oldType : self.parent.type, false);
  // }


  // function onChildRename(child, keyPath, oldName, newName, original){
  //   var allow = newName && type != 'array' && !(newName in value) && original;
  //   if(allow){
  //     value[newName] = child.value;
  //     delete value[oldName];
  //     if (self.inserting) {
  //       child.emit('append', child, [newName], 'name', newName, true);
  //       self.inserting = false;
  //       return;
  //     }
  //   }
  //   else if(oldName === undefined){
  //     // A new node inserted via the UI
  //     original && removeChild(child);
  //   }
  //   else if (original){
  //     // Cannot rename array keys, or duplicate object key names
  //     child.name = oldName;
  //     return;
  //   }
  //   // value[keyPath] = newName;
  //
  //   // child.once('rename', onChildRename);
  //
  //   if (self.withRootName || !self.isRoot) {
  //     keyPath.unshift(name);
  //   }
  //   else if (self.withRootName && self.isRoot) {
  //     keyPath.unshift(name);
  //   }
  //   if (oldName !== undefined) {
  //     self.emit('rename', child, keyPath, oldName, newName, false);
  //   }
  // }


  // onChildAppend(child, keyPath, nameOrValue, newValue, sender){
  //   if (this.withRootName || !this.isRoot) {
  //     keyPath.unshift(name);
  //   }
  //   // self.emit('append', child, keyPath, nameOrValue, newValue, false);
  //   sender && updateObjectChildCount();
  // }


  // onChildChange(child, keyPath, oldValue, newValue, recursed){
  //   if(!recursed){
  //     value[keyPath] = newValue;
  //   }
  //
  //   if (self.withRootName || !self.isRoot) {
  //     keyPath.unshift(name);
  //   }
  //   self.emit('change', child, keyPath, oldValue, newValue, true);
  // }


  //  onChildDelete(child, keyPath, deletedValue, parentType, passive){
  //   var key = child.name;
  //
  //   if (passive) {
  //     if (self.withRootName/* || !self.isRoot*/) {
  //       keyPath.unshift(name);
  //     }
  //     self.emit('delete', child, keyPath, deletedValue, parentType, passive);
  //     updateObjectChildCount();
  //   }
  //   else {
  //     if (type == 'array') {
  //       value.splice(key, 1);
  //     }
  //     else {
  //       delete value[key];
  //     }
  //     refresh(true);
  //   }
  // }


  onChildClick = (child: JSONTreeView, keyPath: string[], value: any) => {
    if (this.withRootName || !this.isRoot) {
      keyPath.unshift(this.name);
    }
    this.emit('click', child, keyPath, value);
  }


   onChildExpand =(child: JSONTreeView, keyPath:string[], value:any) => {
    if (this.withRootName || !this.isRoot) {
      keyPath.unshift(this.name);
    }
     this.emit('expand', child, keyPath, value);
  }


  onChildCollapse = (child: JSONTreeView, keyPath: string[], value: any) => {
    if (this.withRootName || !this.isRoot) {
      keyPath.unshift(this.name);
    }
    this.emit('collapse', child, keyPath, value);
  }


  onChildRefresh = (child: JSONTreeView, keyPath: string[], value: any) => {
    if (this.withRootName || !this.isRoot) {
      keyPath.unshift(this.name);
    }
    this.emit('refresh', child, keyPath, value);
  }
  on(eventName: string, callback: (...args: any) => void) {
    this.addEventListener(eventName, callback)
  }
  emit(eventName: string, obj: JSONTreeView, keyPaths:string[], value: any, parentType: string = null, passive = false){

  }

  addDomEventListener(element: HTMLElement, name: string, fn: (...args: any) => void){
    element.addEventListener(name, fn);
    this.domEventListeners.push({element : element, name : name, fn : fn});
  }
}
