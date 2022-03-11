import './css/app.css';
import './css/icons.css';

import {highlightActiveLine, EditorView, keymap, Decoration, DecorationSet} from "@codemirror/view";
import { closeBrackets } from '@codemirror/closebrackets'
import { indentWithTab } from '@codemirror/commands'
import { highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter'
import { EditorState } from '@codemirror/state'
const updateCallback = EditorView.updateListener.of((update) => update.docChanged && onChange(update.state.doc.toString()))

let delay: NodeJS.Timeout = null
// let previewFrame: HTMLIFrameElement = null;
let preview: Document = null;
const onChange = (src: string) => {
  clearTimeout(delay);
  delay = setTimeout(() => {
    updatePreview(src)
  }, 300);
}
const updatePreview = (src: string) => {
  // const previewFrame: HTMLIFrameElement = document.getElementById('preview');
  // var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  preview.open();
  preview.write(src);
  preview.close();
}
function ready(fn: () => void) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  // const previewFrame: HTMLIFrameElement = document.querySelector('#preview');
  // preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  // const editorView = new EditorView({
  //   state: EditorState.create({
  //     extensions: [
  //       closeBrackets(),
  //       lineNumbers(),
  //       highlightActiveLine(),
  //       highlightActiveLineGutter(),
  //       keymap.of([indentWithTab]),
  //       updateCallback,
  //     ],
  //   }),
  // });

  // const div = document.createElement('div')
  // div.id = 'app'
  // document.body.appendChild(div);
  // div.append(editorView.dom)
  // console.log(editorView)
})
