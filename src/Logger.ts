import chalk from 'chalk';
import program from 'commander';

type Color = (...text: string[]) => string;

let _bundleProgressBar: any;
let _oraSpinner: any;

let _printNewLineBeforeNextLog = false;

function _maybePrintNewLine() {
  if (_printNewLineBeforeNextLog) {
    _printNewLineBeforeNextLog = false;
    console.log();
  }
}

function consoleLog(...args: any[]) {
  _maybePrintNewLine();
  console.log(...args);
}

function consoleWarn(...args: any[]) {
  _maybePrintNewLine();
  console.warn(...args);
}

function consoleError(...args: any[]) {
  _maybePrintNewLine();
  console.error(...args);
}

function respectProgressBars(commitLogs: () => void) {
  if (_bundleProgressBar) {
    _bundleProgressBar.terminate();
    _bundleProgressBar.lastDraw = '';
  }
  if (_oraSpinner) {
    _oraSpinner.stop();
  }
  commitLogs();

  if (_bundleProgressBar) {
    _bundleProgressBar.render();
  }
  if (_oraSpinner) {
    _oraSpinner.start();
  }
}

function getPrefix(chalkColor: Color) {
  return chalkColor(`[${new Date().toTimeString().slice(0, 8)}]`);
}

function withPrefixAndTextColor(args: any[], chalkColor: Color = chalk.gray) {
  if (program.nonInteractive) {
    return [getPrefix(chalkColor), ...args.map(arg => chalkColor(arg))];
  } else {
    return args.map(arg => chalkColor(arg));
  }
}

function withPrefix(args: any[], chalkColor = chalk.gray) {
  if (program.nonInteractive) {
    return [getPrefix(chalkColor), ...args];
  } else {
    return args;
  }
}

function log(...args: any[]) {
  if (log.config.raw) {
    return;
  }

  respectProgressBars(() => {
    consoleLog(...withPrefix(args));
  });
}

log.nested = function(message: any) {
  respectProgressBars(() => {
    consoleLog(message);
  });
};

log.newLine = function newLine() {
  respectProgressBars(() => {
    consoleLog();
  });
};

log.printNewLineBeforeNextLog = function printNewLineBeforeNextLog() {
  _printNewLineBeforeNextLog = true;
};

log.error = function error(...args: any[]) {
  if (log.config.raw) {
    return;
  }

  respectProgressBars(() => {
    consoleError(...withPrefixAndTextColor(args, chalk.red));
  });
};

log.warn = function warn(...args: any[]) {
  if (log.config.raw) {
    return;
  }

  respectProgressBars(() => {
    consoleWarn(...withPrefixAndTextColor(args, chalk.yellow));
  });
};

log.gray = function(...args: any[]) {
  if (log.config.raw) {
    return;
  }

  respectProgressBars(() => {
    consoleLog(...withPrefixAndTextColor(args));
  });
};

log.raw = function(...args: any[]) {
  if (!log.config.raw) {
    return;
  }

  respectProgressBars(() => {
    consoleLog(...args);
  });
};

log.chalk = chalk;

log.config = {
  raw: false,
};

export default log;
