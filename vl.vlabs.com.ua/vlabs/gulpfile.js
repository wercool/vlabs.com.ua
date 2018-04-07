const gulp                = require('gulp');
const gulpif              = require('gulp-if');
const color               = require('gulp-color');
const dirSync             = require('gulp-directory-sync');
const connect             = require('gulp-connect');
const browserify          = require('browserify');
const babelify            = require('babelify');
const source              = require('vinyl-source-stream');
const buffer              = require('vinyl-buffer');
const uglify              = require('gulp-uglify');
const sourcemaps          = require('gulp-sourcemaps');
const purgeSourcemaps     = require('gulp-purge-sourcemaps');
const gutil               = require('gulp-util');
const cors                = require('cors');
const obfuscator          = require('gulp-javascript-obfuscator');
const replace             = require('gulp-replace');
const fs                  = require('fs');
const cryptoJs            = require('gulp-crypto-js');

var initObj = {};

gulp.task('build', ['vlab-nature-process'], function () {
    return browserify({
        entries: [
            './src/' + initObj.vlabDir + '/index.js'
        ],
        debug: true
    })
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(replace('<!--VLAB NATURE PASSPHRASE-->', (!initObj.naturePlain) ? initObj.settings.VLabNaturePassPhrase : ''))
    .pipe(replace('<!--VLAB AUTH REQUIRED-->', process.argv.indexOf('--noauth') == -1 ? 'true' : 'false'))
    .pipe(replace('<!--VLAB COLLABORATOR HOST-->', initObj.settings.VLabsCollaboratorHost))
    .pipe(gulpif(initObj.mode != 'prod', 
        sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(initObj.mode != 'prod', 
        sourcemaps.write('./maps')))
    .pipe(gulpif(initObj.mode == 'prod', 
        uglify()))
    .pipe(gulpif(initObj.mode == 'prod', 
        obfuscator({compact: true, sourceMap: false})))
    .pipe(gulp.dest('./build/' + initObj.vLabName))
    .on('end', function() {
        if (initObj.mode == 'vlabs') {
            gulp.src('')
            .pipe(dirSync('./build', '../../rest.vlabs.com.ua/bin/main/static/vlabs', { 
                ignore: [],
                nodelete: false,
                printSummary: true
            }))
            .on('end', function () {
                console.log(color('VLab ', 'GREEN') + color(initObj.vLabName, 'BLUE') + color(' build completed; static REST resources updated', 'GREEN'));
            });
        } else {
            console.log(color('VLab ', 'GREEN') + color(initObj.vLabName, 'BLUE') + color(' build completed ', 'GREEN'));
        }
    });
});

gulp.task('vlab-nature-process', ['main', 'sync'], function () {
    return gulp.src('./src/' + initObj.vlabDir + '/resources/nature.json')
    .pipe(replace('<!--VLAB REST API URL-->', initObj.settings.VLabsREST))
    .pipe(gulpif(!initObj.naturePlain, cryptoJs({algorithm: 'AES', action: 'encrypt', key: initObj.settings.VLabNaturePassPhrase})))
    .pipe(gulp.dest('./build/' + initObj.vLabName + '/resources'))
});

gulp.task('sync', ['main', 'sync-vlabs-assets', 'sync-vlab-items'], function() {
    return gulp.src('')
    .pipe(dirSync('./src/' + initObj.vlabDir, './build/' + initObj.vLabName, { 
        ignore: [
            'index.js',
            './src/' + initObj.vlabDir + '/resources/nature.json'
        ],
        printSummary: true
    }));
});

gulp.task('sync-vlab-items', ['main'], function() {
    return gulp.src('')
    .pipe(dirSync('./src/vlabs.items', './build/vlabs.items', { 
        ignore: ['index.js'],
        printSummary: true
    }));
});

gulp.task('sync-vlabs-assets', ['main'], function() {
    return gulp.src('')
    .pipe(dirSync('./src/vlabs.assets', './build/vlabs.assets', { 
        ignore: [],
        printSummary: true
    }));
});

gulp.task('sync-vlabs-assets', ['main'], function() {
    return gulp.src('')
    .pipe(dirSync('./src/vlabs.assets', './build/vlabs.assets', { 
        ignore: [],
        printSummary: true
    }));
});

/*
    --vlab [./src/vlab.dir.name]
    --mode [dev | prod | vlabs]
    --noauth
    --nature-plain
*/
gulp.task('main', function () {
    var errors = [];
    if (process.argv.indexOf('--vlab') > -1)
    {
        initObj.vlabDir = process.argv[process.argv.indexOf('--vlab') + 1];
        if (!initObj.vlabDir) {
            errors.push(color('--vlab [?] is missing!', 'RED'));
        }
    } else {
        errors.push(color('--vlab is missing!', 'RED'));
    }
    if (process.argv.indexOf('--mode') > -1) {
        initObj.mode = process.argv[process.argv.indexOf('--mode') + 1];
        if (!initObj.mode) {
            errors.push(color('--mode [?] is missing!', 'RED'));
        }
    } else {
        errors.push(color('--mode is missing!', 'RED'));
    }
    if (errors.length > 0) {
        for (error of errors) {
            console.log(error);
        }
        process.exit();
    }
    initObj.naturePlain = (process.argv.indexOf('--nature-plain') > -1);
    initObj.vLabName = initObj.vlabDir.substr(initObj.vlabDir.lastIndexOf('/') + 1);
    console.log(color('Processing ' + initObj.vLabName + ' VLab...', 'BLUE'));
    initObj.settings = JSON.parse(fs.readFileSync('./settings-' + ((initObj.mode != 'vlabs') ? initObj.mode : 'dev') + '.json'));
});

gulp.task('watch', ['build'], function () {
    if (initObj.mode == 'prod') return;
    gulp.watch(['./src/' + initObj.vlabDir + '/**/*.js',
                './src/' + initObj.vlabDir + '/**/*.json',
                './src/' + initObj.vlabDir + '/**/*.html',
                './src/vlabs.core/**/*.*',
                './src/vlabs.items/**/*.*',
                './src/vlabs.assets/**/*.*'
                ], ['build']);
});

//Start a test server with doc root at build folder and 
//listening to 9001 port. Home page = http://localhost:9001
gulp.task('server', function(){
    if (initObj.mode) {
        if (initObj.mode != 'dev') return;
    }
    connect.server({
        root : './build',
        livereload : false,
        port : 9001,
        host: '0.0.0.0',
        middleware: function() {
            return [cors()];
        }
    });
});

gulp.task('default', ['main', 'build', 'watch', 'server']);
