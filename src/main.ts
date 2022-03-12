import './css/app.css';
import './css/icons.css';

import {highlightActiveLine, EditorView, keymap, Decoration, DecorationSet} from "@codemirror/view";
import {basicSetup} from "@codemirror/basic-setup"
import { closeBrackets } from '@codemirror/closebrackets'
import { indentWithTab } from '@codemirror/commands'
import { highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter'
import { EditorState } from '@codemirror/state';
import {html} from "@codemirror/lang-html";
import {javascript, javascriptLanguage} from "@codemirror/lang-javascript"
import {css} from "@codemirror/lang-css";
import {json} from "@codemirror/lang-json";
import {CompletionContext} from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/matchbrackets";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import {JSONTreeView} from './debug-tree-view';
import './devtools.css';

const updateCallback = EditorView.updateListener.of((update) => update.docChanged && onChange(update.state.doc.toString()))

let delay: NodeJS.Timeout = null
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
  try {
    preview.write(src);
  } catch (e) {

  }
  preview.close();
}
function ready(fn: () => void) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


const myTheme = EditorView.theme({
  "&": {
    color: "#7b776b",
    backgroundColor: "#f6fafd",
    fontSize: "10.5pt",
    // border: "1px solid #c0c0c0"
  },
  ".cm-content": {
    fontFamily: "Menlo, Monaco, Lucida Console, monospace",
    // minHeight: "200px",
    caretColor: "#0e9"
  },

  "&.cm-editor.cm-focused": {
    outline: "none"
  },
  "&.cm-focused .cm-cursor": {
    // borderLeftColor: "#0e9"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    // backgroundColor: "#074"
  },
  ".cm-gutters": {
    backgroundColor: "#f6fafd",
    color: "#8099b3",
    border: "none"
  }
}, {dark: false})


ready(() => {
  const tutorial = document.querySelector('#tutorial')
  tutorial.addEventListener('change', (e) => {
    console.log((e.target as  HTMLSelectElement).value)
  })
  const previewFrame: HTMLIFrameElement = document.querySelector('#preview');

  const debugOut = document.querySelector('.console-out');
  const consoleClear = document.querySelector('.console-clear');
  consoleClear.addEventListener('click', (e) => {
    debugOut.innerHTML = '';
  })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const previewConsole = previewFrame.contentWindow.console
  const _log = previewConsole.log
  previewConsole.log = function(...rest: any) {
    // window.parent is the parent frame that made this window
    window.parent.postMessage(
        {
          source: 'previewIframe',
          message: rest,
        },
        '*'
    );
    // Finally applying the console statements to saved instance earlier
    // eslint-disable-next-line prefer-rest-params
    _log.apply(console, arguments);
  };
  window.addEventListener('message', function(response) {
    // Make sure message is from our iframe, extensions like React dev tools might use the same technique and mess up our logs
    if (response.data && response.data.source === 'previewIframe') {
      // Do whatever you want here.
      const line = document.createElement('div');
      line.className = 'console-line'
      response.data.message.forEach((item: any) => {
        const info = new JSONTreeView(item);
        line.appendChild(info.dom)
      })
      debugOut.appendChild(line)
    }
  });
  // bindIFrameMousemove(previewFrame);
  // bindIFrameMouseup(previewFrame);
  // console.log('previewFrame', previewFrame )
  preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  const editorView = new EditorView({
    parent: document.querySelector('#editor'),
    state: EditorState.create({
      extensions: [
        basicSetup,
        myTheme,
        // json(),
        // css(),
        html(),
        javascript(),
        // closeBrackets(),
        // bracketMatching(),
        // lineNumbers(),
        // highlightActiveLine(),
        // highlightActiveLineGutter(),
        // highlightSelectionMatches(),
        autocompletion(),
        keymap.of([indentWithTab]),
        updateCallback,
      ],
    }),
  });
  debugger
  const aa = new JSONTreeView( {
      hello : 'world',
      doubleClick : 'me to edit',
      a : null,
      b : true,
      c : false,
      d : 1,
      e : {nested : 'object'},
      f : [1,2,3],
      g: {a:1, b: [1,2,3], c: {d:2, e: 'asda', f: {f1: "123123", f2:[123], f3:{}}}}
    });
  const bb = new JSONTreeView('aaaa', {
    hello : 'world',
    doubleClick : 'me to edit',
    a : null,
    b : true,
    c : false,
    d : 1,
    e : {nested : 'object'},
    f : [1,2,3]
  });
  const line = document.createElement('div');
  line.className = 'console-line'

  line.appendChild(bb.dom)
  line.appendChild(aa.dom)
  document.querySelector('.middle ').appendChild(line)
})
