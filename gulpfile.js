'use strict';
// https://github.com/gulpjs/gulp/tree/v3.9.1/docs/recipes

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const run = require('gulp-run-command').default;
const clean = require('gulp-clean');
const tslint = require("gulp-tslint");

const tsProject = ts.createProject('tsconfig.json', {
  declaration: true
});

const tsTestProject = ts.createProject('tsconfig.json', {
  declaration: true
});

// fetch command line arguments
const arg = ((argList) => {
  let arg = {},
    a, opt, thisOpt, curOpt;
  for (a = 0; a < argList.length; a += 1) {
    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {
      // argument value
      if (curOpt) {
        arg[curOpt] = opt;
      }
      curOpt = null;
    } else {
      // argument name
      curOpt = opt;
      arg[curOpt] = true;
    }
  }
  return arg;
})(process.argv);

gulp.task("lint", () => {
  let fixLint = false;
  if (arg.fix) {
    fixLint = true;
  }
  return gulp.src(['src/**/*.ts', '!node_modules/**'])
    .pipe(tslint({
      formatter: "prose",
      fix: fixLint
    }))
    .pipe(tslint.report({
      summarizeFailureOutput: true
    }))
});

gulp.task('clean-scripts', function() {
  return gulp.src('dist/*', {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
});

gulp.task('clean-test-scripts', function() {
  return gulp.src('dist-test', {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
});

gulp.task('test-copy-files', () => {
  return gulp.src(['src/**/*.json', 'config/*.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('test-scripts', () => {
  return gulp.src(['src/**/*.ts'])
    .pipe(tsTestProject())
    .pipe(gulp.dest('dist-test'));
});

gulp.task('nyc', run("nyc --check-coverage --lines 85 --functions 85 --branches 85 mocha --require co-mocha 'dist-test/**/*.spec.js'", {
  env: {
    NODE_ENV: 'test'
  }
}))
// Runs all the test, doing validation for code coverage.
gulp.task('code-coverage', gulp.series('clean-test-scripts', 'test-copy-files', 'test-scripts', 'nyc'), function() {
  console.log("I got called1");
  // return run("nyc --check-coverage --lines 95 --functions 95 --branches 95 mocha --require co-mocha 'dist-test/**/*.spec.js'", {
  //   env: {
  //     NODE_ENV: 'test'
  //   }
  // })
});

// Runs all the tests, or a single one (if --spec is passed in) without code coverage
gulp.task('run-test', () => {
  process.env.NODE_ENV = 'test';
  let defaultTests = ['dist-test/**/*.spec.js'];
  let tests;

  if (arg.spec) {
    tests = ['dist-test/' + arg.spec + '.spec.js'];
  } else {
    tests = defaultTests;
  }

  return gulp.src(tests, {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec',
      exit: true
    }))
    .on('error', console.error);
});

// Runs all the tests, or a single one (if --spec is passed in) without code coverage
gulp.task('test', gulp.series('clean-test-scripts', 'test-copy-files', 'test-scripts', 'run-test'), () => {});

gulp.task('copy-files', () => {
  return gulp.src(['src/**/*.json', 'config/*.json'])
    .pipe(gulp.dest('dist'));
});


gulp.task('build', () => {
  return gulp.src(['src/**/*.ts', '!src/**/*.spec.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', gulp.series('clean-scripts', 'copy-files', 'build'), () => {});

gulp.task('watch', gulp.series('scripts'), () => {
  return gulp.watch(['src/**/*.ts', '!src/**/*.spec.js'], ['scripts']);
});

gulp.task('dev', gulp.series('scripts', 'watch'), () => {
  process.env.NODE_ENV = 'development';
  return nodemon({
    script: 'dist/index.js',
    watch: ['dist/controllers/**/*.js', 'dist/routes/**/*.js', 'dist/services/**/*.js', 'dist/models/**/*.js', 'dist/middleware/**/*.js'],
    ignore: ['dist/**/*.spec.js', 'dist/**/*.d.ts'],
    env: {
      'NODE_ENV': 'development'
    }
  });
})

gulp.task('default', gulp.series(gulp.parallel('lint', 'scripts'), 'test'), () => {
  // This will only run if the lint task is successful...
});