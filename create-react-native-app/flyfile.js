const { join } = require('path');

const paths = {
  build: 'build',
  source: 'src/**/*.js',
  sourceRoot: join(__dirname, 'src'),
};

export default async function (fly) {
  await fly.watch(paths.source, 'babel');
}

export async function babel(fly, opts) {
  await fly.clear(paths.build).source(opts.src || paths.source).babel().target(paths.build);
}

export async function clean(fly) {
  await fly.clear(paths.build);
}

export async function publish(fly) {
  await fly.serial(["clean", "babel"]).shell("npm publish");
}
