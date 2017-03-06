const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const shell = require('gulp-shell');
const sourcemaps = require('gulp-sourcemaps');
const rimraf = require('rimraf');

const paths = {
  source: 'src/**/*.js',
  build: 'build',
  sourceRoot: path.join(__dirname, 'src'),
};

const tasks = {
  babel() {
    return gulp
      .src(paths.source)
      .pipe(changed(paths.build))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('__sourcemaps__', { sourceRoot: paths.sourceRoot }))
      .pipe(gulp.dest(paths.build));
  },

  watchBabel(done) {
    gulp.watch(paths.source, tasks.babel);
    done();
  },
};

gulp.task('build', tasks.babel);
gulp.task('babel', tasks.babel);
gulp.task('watch', tasks.watchBabel);
gulp.task('clean', done => {
  rimraf(paths.build, done);
});

gulp.task(
  'publish',
  gulp.series(done => rimraf(paths.build, done), tasks.babel, shell.task(['npm publish']))
);

gulp.task('default', gulp.series('watch'));
