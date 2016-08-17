/**
 * DO NOT EDIT: This file is part of the smartcontent-cdk
 *
 * Main elixir mixin and gulp tasks.
 *
 */

// -------------------------------------------
// Custom tasks specific to the creative should
// be defined in ./tasks.creative.js
// -------------------------------------------
require('./tasks.creative');

// -------------------------
// Setup global dependencies
// -------------------------
var utils = require('gulp-util');
var del = require('del');
var elixir = require('laravel-elixir');
var task = elixir.Task;

// -------------
// Configuration
// -------------
elixir.config.assetsPath = 'src';
elixir.config.publicPath = 'dist';
var creativeName = __dirname.split('/').slice(-1)[0];
// -------------


// ======================================================
// Single elixir alias within which all tasks are defined
// ======================================================

elixir.extend('creative', function () {


  // ----------
  // Update CDK
  // ----------
  function updateCdk() {
    [
      {
        src: "node_modules/smartcontent-cdk/tasks.js",
        dst: "tasks.js"
      },
      {
        src: "node_modules/smartcontent-cdk/lib/main.js",
        dst: "src/js/main.js"
      },
    ].forEach(function (path) {
      elixir.mixins.copy(path.src, path.dst);
    });
  }

  if (utils.env.updateCdk) {
    return updateCdk();
  }
  // -----------


  // ------------
  // Clean build
  // ------------
  (function () {
    var paths = ['dist/**/*', 'zip/**/*'];
    new task('clean', function () {
        return del.sync(paths);
      }, {src: paths, output: 'Trash!'}
    ).recordStep('Paths Deleted');
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
        testInclude: elixir.inProduction ? '' : require('./test/include')
      },
      inlineOptions: {
        rootpath: __dirname + '/dist/'
      }
    };
    var paths = new elixir.GulpPaths().src(config.src).output(config.dst);
    var _task = new task('processHtml', function ($) {
      return gulp.src(paths.src.path, {dot: true})
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
      var buildPaths = ['dist/js/**/*', 'dist/css/**/*'];
      new task('clean', function () {
          return del.sync(buildPaths);
        }, {src: buildPaths, output: 'Trash!'}
      ).recordStep('Paths Deleted');
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

    var srcDirectory = 'dist/';
    var zipFile = creativeName + '_' + moment().format('YYYYMMDD-HHmmss') + '.zip';
    var zipPath = __dirname + '/zip/' + zipFile;

    new task('zip', function () {
        var output = fs.createWriteStream(zipPath);
        var archive = archiver('zip', {});
        archive.pipe(output);
        return archive.directory(srcDirectory, '/').finalize();
      }, {src: srcDirectory, output: zipFile}
    ).recordStep('Zip file written to Destination');
  })();
  // ------------------------------


  // -------------------
  // Compile Test bundle
  // (development only)
  // -------------------
  if (!elixir.inProduction) {
    elixir.mixins.rollup('test/test.js', 'dist/js/test.js');
  }
  // -------------------


});
// ======================================================
