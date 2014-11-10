'use strict';

//---------------
//Bootstrapping
//----------------
var gulp = require('gulp');

//Store gulp plugins inside $ variable
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'lazypipe', 'minimist']
});

//Read CLI arguments & populate variables
var ARGV = $.minimist(process.argv),
    ENVIRONMENT = ARGV.environment || 'development',
    DATE = new Date().toISOString(),
    IS_PRODUCTION = (ENVIRONMENT === 'production');

function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

//---------------
//Styles (less) compilation
//----------------
gulp.task('styles-compilation', false, function () {
  return gulp.src('src/{app,components}/**/*.less')
      .pipe($.less({
        paths: [
          'src/bower_components',
          'src/app',
          'src/components'
        ]
      }))
      .on('error', handleError)
      .pipe($.autoprefixer('last 1 version'))
      .pipe(gulp.dest('.tmp'))
      .pipe($.size());
});


//---------------
//Typescript compilation
//----------------
gulp.task('typescript-compilation', false, function () {
  var tsResult = gulp.src('src/{app,components}/**/*.ts')
      .pipe($.sourcemaps.init()) // This means sourcemaps will be generated
      .pipe($.typescript({
        sortOutput: true,
        declarationFiles: true,
        noExternalResolve: true,
        target : 'ES5'
      }));

  return tsResult.js
    //.pipe(concat('output.js')) // You can use other plugins that also support gulp-sourcemaps
      .pipe($.sourcemaps.write()) // Now the sourcemaps are added to the .js file
      .pipe(gulp.dest('.tmp'));
});

//---------------
//Scripts Validation
//----------------
gulp.task('scripts-jshinting', false, function () {
  return gulp.src('src/{app,components}/**/*.js')
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.size());
});


//---------------
//Partials - Compiles the partials into the tmp folder as template cache js files
//----------------
gulp.task('partials-compilation', false, function () {

  //Start from jade templates, and send over the compiled html to the html minifier, and then ngHtml2Js template cache
  var JADE_LOCALS = {
    'DATE' : DATE,
    'ENVIRONMENT' : ENVIRONMENT
  };

  //Update: Since we somehow can't get $.filter to filterout the main index for the minify & html2js parts, we need to
  //build it separately.
  gulp.src(['src/app/index.jade'])
    .pipe($.jade({
      locals: JADE_LOCALS,
      pretty: true
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size());

  return gulp.src(['src/{app,components}/**/*.jade','!src/app/index.jade'])
      .pipe($.jade({
        locals: JADE_LOCALS
      }))
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe($.ngHtml2js({
        moduleName: 'dashboard'
      }))
      .pipe(gulp.dest('.tmp'))
      .pipe($.size());
});


////---------------
////Partials - Compiles the partials into the tmp folder as template cache js files
////----------------
//gulp.task('partials_better_but_not_working', function () {
//
//  //Convert html partials to javascript pipe
//  var htmlToJsPipe = $.lazypipe()
//    .pipe(function() {
//      return $.minifyHtml({
//        empty: true,
//        spare: true,
//        quotes: true
//      });
//    })
//    .pipe(function() {
//      return $.ngHtml2js({
//        moduleName: 'dashboard'
//      });
//    });
//
//  //Start from jade templates, and send over the compiled html to the html minifier, and then ngHtml2Js template cache
//  var JADE_LOCALS = {
//    'DATE' : DATE,
//    'ENVIRONMENT' : ENVIRONMENT
//  };
//
//  return gulp.src(['src/{app,components}/**/*.jade'])
//    .pipe($.jade({
//      locals: JADE_LOCALS
//    }))
//    .pipe($.if('!src/app/index.*', htmlToJsPipe()))
//    .pipe(gulp.dest('.tmp'))
//    .pipe($.size());
//});


//----------------------
// Production Html index generation
// - Injects CSS and javascript into the html styles
// - First tasks run in parallel are styles, scripts and the partials generation, saved in tmp folder
// - Afterwards the injection of all assets is done
//----------------------
gulp.task('assets-injection-and-optimization', false, ['typescript-compilation', 'styles-compilation', 'scripts-jshinting', 'partials-compilation'], function () {

  //Filters
  var htmlFilter = $.filter('*.html'),
      jsFilter = $.filter('**/*.js'),
      cssFilter = $.filter('**/*.css'),
      bowerMainFilesJsRegex = (/.*\.js$/i),
      assets = $.useref.assets(),
      assetsCopy = $.useref.assets(),
      partials = '.tmp/{app,components}/**/*.js',
      projectJs = 'src/{app,components}/**/*.js',
      projectCss = '.tmp/**/*.css';

  //Subtasks

  //Populate index.html template css & js placeholders dynamically
  var injectAssetsIntoHtml = $.lazypipe()

    //Inject application JS
    //We add automatic angular js filesorting
    .pipe(function(){
      return $.inject(
        gulp.src([projectJs]).pipe($.angularFilesort()), {
          read: false,
          addRootSlash: false,
          starttag: '<!--application:js-->',
          endtag: '<!--endapplicationjs-->'
        });
    })
    //Inject JS html-template partials
    .pipe(function() {
      return $.inject(gulp.src(partials, {read:false}), {
        read: false,
        starttag: '<!--application:partials-->',
        endtag: '<!--endapplicationpartials-->',
        addRootSlash: false
      });
    })

    //Inject JS bower dependencies
    .pipe(function() {
      return $.inject(gulp.src($.mainBowerFiles({filter: bowerMainFilesJsRegex}), {read: false}), {
        read: false,
        starttag: '<!--bower:js-->',
        endtag: '<!--endbower-->',
        addRootSlash: false
      });
    })

    //Inject css list into html
    .pipe(function() {
      return $.inject(gulp.src(projectCss, {read:false}), {
        read: false,
        addRootSlash: false,
        starttag: '<!--application:css-->',
        endtag: '<!--endapplicationcss-->'
      });
    });


  //JS minification pipe
  var minifyJs = $.lazypipe()
    .pipe(function() {return jsFilter;})
    .pipe($.ngAnnotate)
    .pipe(function() { return $.uglify({preserveComments: $.uglifySaveLicense}); })
    .pipe(function() { return jsFilter.restore(); });

  //CSS minifications pipe
  var minifyCss = $.lazypipe()
    .pipe(function() { return cssFilter; })
    .pipe(function() { return $.replace('bower_components/bootstrap/fonts', 'fonts'); }) //replace dest path
    .pipe(function() { return $.csso(); }) //minify
    .pipe(function() { return cssFilter.restore(); });

  //HTML minification pipe
  var minifyHtml = $.lazypipe()
    .pipe(function() { return htmlFilter; })
    .pipe(function() { return $.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    });
    })
    .pipe(function() { return htmlFilter.restore(); });

  //concatenate, minify and version all css/js files within html build tag groups
  var optimizeIncludes = $.lazypipe()
    .pipe(function() { return assets; })
    .pipe($.rev)
    .pipe(minifyJs)
    .pipe(minifyCss)
    .pipe(function() { return assets.restore(); })
    .pipe($.useref)
    .pipe($.revReplace) // Substitute in new hashed filenames
    .pipe(minifyHtml);

  //Concatenate & version all css/js files within html build tag groups
  var optimizeIncludesForDevelopment = $.lazypipe()
    .pipe(function() { return assetsCopy; })
    .pipe($.rev)
    .pipe(function() { return assetsCopy.restore(); })
    .pipe($.useref)
    .pipe($.revReplace);

    //- Process main index js/css dependencies
  return gulp.src('.tmp/index.html')

      .pipe(injectAssetsIntoHtml())
      .pipe($.if(IS_PRODUCTION, optimizeIncludes(), optimizeIncludesForDevelopment()))

      //Write out files
      .pipe(gulp.dest('dist'))
      .pipe($.size());
});

//---------------
//Image compression - (compressor is not working on Ubuntu)
//----------------
gulp.task('images', false, function () {
  return gulp.src('src/assets/images/**/*')
      .pipe($.cache($.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      })))
      .pipe(gulp.dest('dist/assets/images'))
      .pipe($.size());
});


//---------------
//Vendor Fonts
//----------------
gulp.task('fonts', false, function () {
  return gulp.src($.mainBowerFiles())
      .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
      .pipe($.flatten())
      .pipe(gulp.dest('dist/fonts'))
      .pipe($.size());
});

gulp.task('clean', false, function () {
  return gulp.src(['.tmp', 'dist'], {read: false}).pipe($.rimraf());
});

gulp.task('cleantmp', false, function () {
  return gulp.src(['.tmp'], {read: false}).pipe($.rimraf());
});

gulp.task('build', 'Build the application, accepts environment parameter', ['assets-injection-and-optimization', 'fonts'], function() {
  gulp.start('cleantmp');

  //Notified of build
  gulp.src('.tmp') //Dummy stream so we can trigger notification
    .pipe($.notify({
    title : 'Build completed',
    subtitle: 'success',
    message : ''
  }));

}, {
  options : {
    'environment [development]' : 'Environment under which we build the application [development|production]'
  }
});
