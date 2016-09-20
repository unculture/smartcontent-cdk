/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * Main elixir mixin and gulp tasks.
 *
 */

// -------------------------
// Setup global dependencies
// -------------------------
var utils = require('gulp-util');
var elixir = require('laravel-elixir');
var task = elixir.Task;

// -------------
// Configuration
// -------------
elixir.config.assetsPath = 'src';
elixir.config.publicPath = 'dist';
var creativePath = process.cwd();
var creativeName = creativePath.split('/').slice(-1)[0];
// -------------

// -------------------------------------------
// Custom tasks specific to the creative should
// be defined in creative /tasks.js
// -------------------------------------------
require(creativePath + '/tasks');
// -------------------------------------------


// =============
// Custom Mixins
// =============
elixir.extend('delete', function (paths) {
  var del = require('del');
  new task('delete', function () {
      return del.sync(paths);
    }, {src: paths, output: 'Trash!'}
  ).recordStep('Paths Deleted');
});

elixir.extend('symlink', function (src, dst) {
  var vfs = require('vinyl-fs');
  new task('symlink', function () {
      return vfs.src(src)
        .pipe(vfs.symlink(dst));
    }, {src: src, output: dst}
  ).recordStep('Symlink Created');
});

// ======================================================
// Single elixir alias within which all tasks are defined
// ======================================================

elixir.extend('creative', function () {


  // ##########################
  // One off tasks
  // ##########################

  // ----------
  // Update CDK
  // ----------
  function updateCdk() {
    [
      {
        src: "node_modules/smartcontent-cdk/src/main.js",
        dst: "src/js/main.js"
      },
      {
        src: "node_modules/smartcontent-cdk/src/events.js",
        dst: "test/events.es6.js"
      },
    ].forEach(function (path) {
      elixir.mixins.copy(path.src, path.dst);
    });
  }

  if (utils.env.updateCdk) {
    return updateCdk();
  }
  // ----------

  // ----------------------
  // Compile Browser events
  // Symlink assets
  // ----------------------
  function browserEvents() {
    elixir.mixins.rollup(
      './test/events.es6.js',
      'test/events.js',
      null
    );
    elixir.mixins.delete('test/events.js.map');
  }

  if (utils.env.browserEvents) {
    return browserEvents();
  }
  // ----------------------

  // ##########################


  // ##########################
  // Default tasks
  // ##########################

  // ------------
  // Clean build
  // ------------
  (function () {
    elixir.mixins.delete(['dist/**/*', 'zip/**/*']);
  })();
  // ------------


  // ------------------
  // Copy static assets
  // ------------------
  (function () {
    [
      {
        src: "src/fonts",
        dst: "dist/fonts"
      },
      {
        src: "src/images",
        dst: "dist/images"
      },
    ].forEach(function (path) {
      elixir.mixins.copy(path.src, path.dst);
    });
  })();
  // --------------------------


  // ------------
  // Compile SASS
  // ------------
  elixir.mixins.sass('main.scss');
  // ------------

  // ----------
  // Rework CSS
  // ----------
  (function () {
    if (!elixir.inProduction) {
      return;
    }

    var postCss = require('gulp-postcss');
    var postCssUrl = require("postcss-url");
    var config = {
      src: 'dist/css/main.css',
      dst: 'dist/css/main.css'
    };
    var paths = new elixir.GulpPaths().src(config.src).output(config.dst);
    new task('postCss', function ($) {
      return gulp.src(paths.src.path)
        .pipe(
          postCss([
            postCssUrl({
              url: function (url) {
                return url.replace('../', '');
              }
            })
          ])
        )
        .pipe($.if(!paths.output.isDir, $.rename(paths.output.name)))
        .pipe(this.saveAs(gulp));

    }, paths).recordStep('CSS reworked');
  })();


  // ------------
  // Transpile JS
  // ------------
  elixir.mixins.rollup('main.js');
  // ------------


  // ------------
  // Process HTML
  // ------------
  (function () {
    var inlineSource = require('gulp-inline-source');
    var template = require('gulp-template');
    var _startCase = require('lodash').startCase;
    var config = {
      src: 'src/index.html',
      dst: 'dist/index.html',
      templateVars: {
        title: _startCase(creativeName),
        testInclude: elixir.inProduction ? '' : require(creativePath + '/test/include')
      },
      inlineOptions: {
        rootpath: creativePath + '/dist/'
      }
    };
    var paths = new elixir.GulpPaths().src(config.src).output(config.dst);
    var _task = new task('processHtml', function ($) {
      return gulp.src(paths.src.path)
        .pipe(template(config.templateVars))
        .pipe($.if(elixir.inProduction, inlineSource(config.inlineOptions)))
        .pipe($.if(!paths.output.isDir, $.rename(paths.output.name)))
        .pipe(this.saveAs(gulp));

    }, paths);
    _task.watch(paths.src.path).ignore(paths.output.path);
    _task.recordStep('Variables substituted');
    if (elixir.inProduction) {
      _task.recordStep('Inlines processed');
    }

    if (elixir.inProduction) {
      elixir.mixins.delete(['dist/js/**/*', 'dist/css/**/*']);
    }
  })();
  // --------------------------


  // ---------------------------------
  // Create the zip package for upload
  // (production only)
  // ---------------------------------
  (function () {
    if (!elixir.inProduction) return;

    var archiver = require('archiver');
    var fs = require('fs');
    var moment = require('moment');

    var srcGlob = '**/*';
    var srcDir = 'dist/';
    var globOptions = {cwd: creativePath + '/' + srcDir, nodir: true, ignore: 'assets/**'};
    var zipFile = creativeName + '_' + moment().format('YYYYMMDD-HHmmss') + '.zip';
    var zipPath = creativePath + '/zip/' + zipFile;

    new task('zip', function () {
        var output = fs.createWriteStream(zipPath);
        var archive = archiver('zip', {});
        archive.pipe(output);
        return archive.glob(srcGlob, globOptions).finalize();
      }, {src: srcDir + srcGlob, output: zipFile}
    ).recordStep('Zip file written to Destination');
  })();
  // ------------------------------


  // -------------------
  // Compile Test bundle
  // (development only)
  // -------------------
  if (!elixir.inProduction) {
    elixir.mixins.rollup('test.js');
  }
  // -------------------

  // --------------------------------
  // Symlink Assets for local testing
  // --------------------------------
  elixir.mixins.symlink('./assets', './dist');
  // --------------

  // ##########################

});
// ======================================================
