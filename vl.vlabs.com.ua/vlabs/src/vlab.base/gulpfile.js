var gulp        = require('gulp');
var dirSync     = require( 'gulp-directory-sync' );
var connect     = require('gulp-connect');
var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');

var vLabName = __dirname.substr(__dirname.lastIndexOf('/') + 1);

gulp.task('build-prod', ['sync'], function () {
    console.log('vLabName = ' + vLabName);
    return browserify({
        entries: [
            './index.js'
        ],
        debug: false
    })
    .transform("babelify", { presets: ['es2015'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('../../build/' + vLabName));
});

gulp.task('build', ['sync'], function () {
    console.log('vLabName = ' + vLabName);
    return browserify({
        entries: [
            './index.js'
        ],
        debug: true
    })
    .transform("babelify", { presets: ['es2015'] })
    .bundle()
    .pipe(source('bundle.js'))
    // .pipe(buffer())
    // .pipe(sourcemaps.init())
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('../../build/' + vLabName));
});

gulp.task('sync', function() {
    return gulp.src('')
        .pipe(dirSync('./', '../../build/' + vLabName, { 
            ignore: [
                'gulpfile.js',
                'index.js'
            ],
            printSummary: true
        }));
});

gulp.task('watch', ['build'], function () {
    gulp.watch('./**/*.js', ['build']);
    gulp.watch('../vlabs.common.js/**/*.js', ['build']);
});

//Start a test server with doc root at build folder and 
//listening to 9001 port. Home page = http://localhost:9001
gulp.task('server', function(){
    connect.server({
        root : '../../build',
        livereload : false,
        port : 9001
    });
});

gulp.task('default', ['build', 'server', 'watch']);
gulp.task('prod', ['build-prod']);
gulp.task('run', ['server']);