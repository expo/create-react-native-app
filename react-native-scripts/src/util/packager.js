import {
  Project,
  ProjectUtils,
} from 'xdl';

import bunyan from 'bunyan';
import chalk from 'chalk';

function run(onReady) {
  // TODO check to see if packager is running already and run onready if it is

  let packagerReady = false;
  let logBuffer = '';
  const projectDir = process.cwd();
  ProjectUtils.attachLoggerStream(projectDir, {
    stream: {
      write: (chunk) => {

        // don't show the initial packager setup, so that we can display a nice getting started message
        // note: it's possible for the RN packager to log its setup before the express server is done
        // this is a potential race condition but it'll work for now
        if (chunk.msg.indexOf('<END>   Initializing Packager') >= 0) {
          packagerReady = true;
          onReady();
          return;
        }

        if (packagerReady) {
          const message = `${(new Date()).toLocaleString()}: ${chunk.msg}`;
          if (chunk.level <= bunyan.INFO) {
            console.log(message);
          } else if (chunk.level === bunyan.WARN) {
            console.log(chalk.yellow(message));
          } else {
            console.log(chalk.red(message));
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

  // setup graceful shutdown on ctrl+c
  if (process.platform === 'win32') {
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    .on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }

  process.on('SIGINT', () => {
    console.log(chalk.blue('\nStopping packager...'));
    Project.stopAsync(projectDir).then(() => {
      console.log(chalk.green('Packager stopped.'));
      process.exit();
    });
  });

  // TODO make all this anonymous

  console.log(chalk.blue('Starting packager...'));

  Project.startAsync(projectDir).then(() => {}, (reason) => {
    console.log(chalk.red(`Error starting packager: ${reason}`));
    process.exit(1);
  });
}

export default { run };
