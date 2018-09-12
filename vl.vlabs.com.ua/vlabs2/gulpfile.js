const browserify            = require('browserify');
const gulp                  = require('gulp');
const gulpif                = require('gulp-if');
const color                 = require('gulp-color');
const fs                    = require('fs');
const replace               = require('gulp-replace');
const cryptojs              = require('gulp-crypto-js');
const dirsync               = require('gulp-directory-sync');
const obfuscator            = require('gulp-javascript-obfuscator');
const sourcemaps            = require('gulp-sourcemaps');
const uglify                = require('gulp-uglify');
const connect               = require('gulp-connect');
const cors                  = require('cors');
const source                = require('vinyl-source-stream');
const buffer                = require('vinyl-buffer');
const jsdoc                 = require('gulp-jsdoc3');

var initObj = {};

gulp.task('vlab-sync-files', function(done) {
    return gulp.src('./src')
    .pipe(dirsync('./src/vlabs/' + initObj.vLabName, './build/' + initObj.vLabName, { 
        ignore: function(dir, file) {
            if ((new RegExp('.js$')).test(file)) return true; else return false;
        },
        printSummary: true
    }));
});

gulp.task('vlab-nature-process', function () {
    return gulp.src('./src/vlabs/' + initObj.vLabName + '/resources/*.json')
    .pipe(replace('<!--VLAB REST API URL-->', initObj.settings.VLabsREST))
    .pipe(gulpif(!initObj.naturePlain, cryptojs({algorithm: 'AES', action: 'encrypt', key: initObj.settings.VLabNaturePassPhrase})))
    .pipe(gulp.dest('./build/' + initObj.vLabName + '/resources'));
});

gulp.task('sync-vlab-assets', function () {
    return gulp.src('./src')
    .pipe(dirsync('./src/vlab.assets', './build/vlab.assets', { 
        ignore: [],
        printSummary: true
    }));
});

gulp.task('sync-vlab-items', function() {
    return gulp.src('./src')
    .pipe(dirsync('./src/vlab.items', './build/vlab.items', { 
        ignore: ['index.js'],
        printSummary: true
    }));
});

gulp.task('build', gulp.series('sync-vlab-assets', 
                               'sync-vlab-items',
                               'vlab-sync-files',
                               'vlab-nature-process',
                                function transpiling () {
    return browserify('./src/vlabs/' + initObj.vLabName + '/index.js')
    .transform('babelify', {presets: ['@babel/preset-env']})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(replace('<!--VLAB NATURE PASSPHRASE-->', (!initObj.naturePlain) ? initObj.settings.VLabNaturePassPhrase : ''))
    .pipe(replace('<!--VLAB AUTH REQUIRED-->', process.argv.indexOf('--noauth') == -1 ? 'true' : 'false'))
    .pipe(replace('<!--VLAB PROD MODE-->', initObj.mode == 'prod' ? 'true' : 'false'))
    .pipe(gulpif(initObj.mode != 'prod', sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(initObj.mode != 'prod', sourcemaps.write('./maps')))
    .pipe(gulpif(initObj.mode == 'prod', uglify()))
    .pipe(gulpif(initObj.mode == 'prod', obfuscator({compact: true, sourceMap: false})))
    .pipe(gulp.dest('./build/' + initObj.vLabName))
    .on('end', function() {
        console.log(color('VLab ', 'GREEN') + color(initObj.vLabName, 'BLUE') + color(' build completed ', 'GREEN'));
    });
}));

gulp.task('main', function (done) {
    var errors = [];
    if (process.argv.indexOf('--vlab') > -1)
    {
        initObj.vLabName = process.argv[process.argv.indexOf('--vlab') + 1];
        if (!initObj.vLabName) {
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
    if (process.argv.indexOf('--nature-plain') > -1) {
        initObj.naturePlain = true;
        console.log(color('Using non-crypted nature file!', 'YELLOW'));
    } else {
        initObj.naturePlain = false;
    }
    if (errors.length > 0) {
        for (error of errors) {
            console.log(error);
        }
        process.exit();
    }

    initObj.settings = JSON.parse(fs.readFileSync('./settings-' + initObj.mode + '.json'));

    console.log(color('Processing VLab [' + initObj.vLabName + ']', 'GREEN'));
    done();
});

gulp.task('watch', function (done) {
    if (initObj.mode == 'prod') {
        done();
        return;
    }
    gulp.watch(['./src/vlabs/' + initObj.vLabName + '/**/*.js',
                './src/vlabs/' + initObj.vLabName + '/**/*.json',
                './src/vlabs/' + initObj.vLabName + '/**/*.html',
                './src/vlabs/' + initObj.vLabName + '/**/*.css',
                './src/vlabs/' + initObj.vLabName + '/**/*.appcache',
                './src/vlab.fwk/**/*.*',
                './src/vlab.items/**/*.*',
                './src/vlab.assets/**/*.*'
                ], gulp.series('build'));
});

gulp.task('server', function(done){
    if (initObj.mode) {
        if (initObj.mode != 'dev') {
            done();
            return;
        }
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

gulp.task('doc', function (cb) {
    gulp.src(['README.txt', './src/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});

gulp.task('default', gulp.series('main', 'build', gulp.parallel('watch', 'server')));