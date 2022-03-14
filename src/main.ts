import './css/theme.css'
import './css/app.css';
import './css/icons.css';
import './devtools.css';
import './pace-minimal.css';

import {HttpClient} from './common/httpclient'
import {highlightActiveLine, EditorView, keymap, Decoration, DecorationSet} from "@codemirror/view";
import {basicSetup} from "@codemirror/basic-setup"
import { closeBrackets } from '@codemirror/closebrackets'
import { indentWithTab } from '@codemirror/commands'
import { highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter'
import { EditorState, Transaction } from '@codemirror/state';
import {html} from "@codemirror/lang-html";
import {javascript, javascriptLanguage} from "@codemirror/lang-javascript"
import {css} from "@codemirror/lang-css";
import {json} from "@codemirror/lang-json";
import {CompletionContext} from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/matchbrackets";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import {JSONTreeView} from './debug-tree-view';

import pace from 'pace-js';



(window as WindowType).paceOptions  = {
  restartOnRequestAfter: true,
  // ajax: false, // disabled
  // document: false, // disabled
  // eventLag: false, // disabled
  elements: {
    selectors: ['#preview']
  }
}


const updateCallback = EditorView.updateListener.of((update) => update.docChanged && onChange(update.state.doc.toString()))

let delay: NodeJS.Timeout = null
let preview: Document = null;
let editorView: EditorView = null;
let headScripts = '';
let headStyles = '';
let headLinks = '';
function processScript(doc: Document) {
  const scripts: string[] = [];
  doc.querySelectorAll('script').forEach((el: HTMLScriptElement) => {
    let src = el.getAttribute('src');
    if (!src || src.includes('main.js')) {
      return
    }
    src = src.replace('../../', '')
    scripts.push(`<script defer src="${src}"></script>`)
  })
  headScripts = scripts.join('');
}
function processStyle(doc: Document) {
  const styles: string[] = [];
  doc.querySelectorAll('style').forEach((el: HTMLStyleElement) => {
    styles.push(`<style>${el.textContent}</style>`)
  })
  headStyles = styles.join('').replace(/^\s*$\n/gm, '')
}
function processLink(doc: Document) {
  const links: string[] = [];
  doc.querySelectorAll('link').forEach((el: HTMLLinkElement) => {
    let href = el.getAttribute('href');
    if (!href) {
      return
    }
    if (href.startsWith('../../')) {
      href = href.replace('../../', '')
    }
    links.push(`<link rel="stylesheet" href="${href}">`)
  })
  headLinks = links.join('');

}
function setUpPreviewEnv(s: string): Document {
  const doc = new DOMParser().parseFromString(s, 'text/html');
  processScript(doc)
  processStyle(doc)
  processLink(doc)
  return doc
}
const onChange = (src: string) => {
  clearTimeout(delay);
  delay = setTimeout(() => {
    updateIframe(preview, `<head>${headLinks}${headScripts}</head><body>${src}</body>`)
    // preview.body.innerHTML = src;
  }, 300);
}
const updateIframe = (frame: Document, src: string) => {
  frame.open();
  try {
    frame.write(src);
  } catch (e) {
    console.log(e)
  }
  frame.close();
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
  "&.cm-editor": {
    height: "100%"
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
  const tutorial = document.querySelector('#tutorial') as HTMLSelectElement;
  const prevExam: HTMLIFrameElement = document.querySelector('#prevExam');
  const nextExam: HTMLIFrameElement = document.querySelector('#nextExam');
  prevExam.addEventListener('click', () => {
    if (tutorial.selectedIndex<= 0 ) {
      return
    }
    tutorial.selectedIndex -= 1;
    tutorial.dispatchEvent(new Event('change'));
  })
  nextExam.addEventListener('click', () => {
    if (tutorial.selectedIndex >= tutorial.options.length - 1) {
      return
    }
    tutorial.selectedIndex += 1
    tutorial.dispatchEvent(new Event('change'));
  })



  const previewFrame: HTMLIFrameElement = document.querySelector('#preview');



  const docView = document.querySelector('#doc') ; //as HTMLIFrameElement;
  tutorial.addEventListener('change', (e) => {
    pace.restart()
    const url = (e.target as  HTMLSelectElement).value;
    console.log(url)
    HttpClient.get(url).then((r: string) => {
      const doc = setUpPreviewEnv(r);
      const docPart = doc.querySelector('#doc')
      if (docPart) {
        // updateIframe(docView.contentDocument, docPart.innerHTML);
        docView.innerHTML = docPart.innerHTML
      }
      const example = doc.querySelector('#example')
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: example ? `${example.innerHTML} \n\n\n ${headStyles.trim()}` : ''
        }
      })
    })
  })


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
    // Message could not be cloned. Open devtools to see it
    // const args = rest.map((e: any) => {
    //   // if (e.constructor.name == 'CustomEvent') {
    //   //   const {detail} = e
    //   //   return {detail}
    //   // }
    //   return e
    // })
    const line = document.createElement('div');
    line.className = 'console-line'
    rest.forEach((item: any) => {
      const info = new JSONTreeView(item);
      line.appendChild(info.dom)
    })
    debugOut.appendChild(line)
    // try{
    //   window.parent.postMessage(
    //       {
    //         source: 'previewIframe',
    //         message: args,
    //       },
    //       '*'
    //   );
    // } catch (e) {
    //   window.parent.postMessage(
    //       {
    //         source: 'previewIframe',
    //         message: [`[${e.name}] Message display error, Open devtools to see it`],
    //       },
    //       '*'
    //   );
    // }

    // Finally applying the console statements to saved instance earlier
    // eslint-disable-next-line prefer-rest-params
    _log.apply(console, arguments);
  };
  // window.addEventListener('message', function(response) {
  //   if (response.data && response.data.source === 'previewIframe') {
  //     const line = document.createElement('div');
  //     line.className = 'console-line'
  //     response.data.message.forEach((item: any) => {
  //       const info = new JSONTreeView(item);
  //       line.appendChild(info.dom)
  //     })
  //     debugOut.appendChild(line)
  //   }
  // });
  preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  editorView = new EditorView({
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
  console.log(editorView)
  // const newState = EditorState.create({
  //   doc: 'qqqqq',
  // });
  // editorView.setState(newState)

  pace.start()
})
