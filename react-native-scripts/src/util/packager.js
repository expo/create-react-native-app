// @flow

import { Project, ProjectSettings, ProjectUtils } from 'xdl';

import bunyan from 'bunyan';
import chalk from 'chalk';

// TODO get babel output that's nice enough to let it take over the console
function clearConsole() {
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
}

function installExitHooks(projectDir) {
  if (process.platform === 'win32') {
    require('readline')
      .createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      .on('SIGINT', () => {
        process.emit('SIGINT');
      });
  }

  process.on('SIGINT', () => {
    console.log('\nStopping packager...');
    cleanUpPackager(projectDir).then(() => {
      console.log(chalk.green('Packager stopped.'));
      process.exit();
    });
  });
}

async function cleanUpPackager(projectDir) {
  const result = await Promise.race([
    Project.stopAsync(projectDir),
    new Promise((resolve, reject) => setTimeout(resolve, 1000, 'stopFailed')),
  ]);

  if (result === 'stopFailed') {
    // find RN packager pid, attempt to kill manually
    try {
      const { packagerPid } = await ProjectSettings.readPackagerInfoAsync(projectDir);
      process.kill(packagerPid);
    } catch (e) {
      process.exit(1);
    }
  }
}

function run(onReady: () => ?any, options: Object = {}) {
  let packagerReady = false;
  let needsClear = false;
  let logBuffer = '';
  const projectDir = process.cwd();
  ProjectUtils.attachLoggerStream(projectDir, {
    stream: {
      write: chunk => {
        // don't show the initial packager setup, so that we can display a nice getting started message
        // note: it's possible for the RN packager to log its setup before the express server is done
        // this is a potential race condition but it'll work for now
        if (chunk.msg.indexOf('Loading dependency graph, done.') >= 0) {
          packagerReady = true;
          // TODO clearConsole();
          onReady();
          return;
        }

        const messagePrefix = chalk.dim(new Date().toLocaleTimeString()) + ':';

        // we don't need to print the entire manifest when loading the app
        if (chunk.msg.indexOf(' with appParams: ') >= 0) {
          if (needsClear) {
            // this is set when we previously encountered an error
            // TODO clearConsole();
          }
          console.log(`${messagePrefix} Loading your app...\n`);
          return;
        }

        if (packagerReady) {
          const message = `${messagePrefix} ${chunk.msg}\n`;
          if (chunk.level <= bunyan.INFO) {
            console.log(message);
          } else if (chunk.level === bunyan.WARN) {
            console.log(chalk.yellow(message));
          } else {
            console.log(chalk.red(message));

            // if you run into a syntax error then we should clear log output on reload
            needsClear = message.indexOf('SyntaxError') >= 0;
          }
        } else {
          if (chunk.level >= bunyan.ERROR) {
            console.log(chalk.yellow('***ERROR STARTING PACKAGER***'));
            console.log(logBuffer);
            console.log(chalk.red(chunk.msg));
            logBuffer = '';
          } else {
            logBuffer += chunk.msg + '\n';
          }
        }
      },
    },
    type: 'raw',
  });

  installExitHooks(projectDir);
  console.log('Starting packager...');

  Project.startAsync(projectDir, options).then(
    () => {},
    reason => {
      console.log(chalk.red(`Error starting packager: ${reason.stack}`));
      process.exit(1);
    }
  );
}

export default { run };
