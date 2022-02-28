import './css/app.css';
import './css/icons.css';

import './components/ez-tabs-list/index'
import './components/ez-pop-wrapper/index'
import './components/ez-widget/index'

function ready(fn: () => void) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
})
