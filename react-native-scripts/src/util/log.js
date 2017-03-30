import chalk from 'chalk';

let _bundleProgressBar;

function respectProgressBars(commitLogs) {
  if (_bundleProgressBar) {
    _bundleProgressBar.terminate();
    _bundleProgressBar.lastDraw = '';
    commitLogs();
    _bundleProgressBar.render();
  } else {
    commitLogs();
  }
}

log.setBundleProgressBar = function setBundleProgressBar(bar) {
  _bundleProgressBar = bar;
};

function log() {
  const prefix = chalk.dim(new Date().toLocaleTimeString()) + ':';
  var args = [prefix].concat(Array.prototype.slice.call(arguments, 0));

  respectProgressBars(() => {
    console.log(...args);
  });
}

log.withoutPrefix = function(...args) {
  respectProgressBars(() => {
    console.log(...args);
  });
};

export default log;
