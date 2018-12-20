const browserify            = require('browserify');
const gulp                  = require('gulp');
const gulpif                = require('gulp-if');
const color                 = require('gulp-color');
const fs                    = require('fs');
const rename                = require('gulp-rename');
const replace               = require('gulp-replace');
const cryptojs              = require('gulp-crypto-js');
const dirsync               = require('gulp-directory-sync');
const minify                = require('gulp-minify');
const sourcemaps            = require('gulp-sourcemaps');
const cleancss              = require('gulp-clean-css');
const connect               = require('gulp-connect');
const cors                  = require('cors');
const source                = require('vinyl-source-stream');
const buffer                = require('vinyl-buffer');
const jsdoc                 = require('gulp-jsdoc3');
const zip                   = require('gulp-zip');
const del                   = require('del');

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

gulp.task('vlab-zip-gltf', function(done) {
    if (initObj.zipGLTF) {
        fs.readdirSync('./src/vlabs/' + initObj.vLabName + '/scenes')
        .filter(function(sceneDir) {
            gulp.src('./src/vlabs/' + initObj.vLabName + '/scenes/' + sceneDir + '/resources/3d/*.*')
            .pipe(zip(sceneDir +'.gltf.zip'))
            .pipe(gulp.dest('./build/' + initObj.vLabName + '/scenes/' + sceneDir + '/resources/3d'));
        });
        done();
    } else {
        done();
        return;
    }
});

gulp.task('vlab-nature-process', function () {
    return gulp.src('./src/vlabs/' + initObj.vLabName + '/resources/vlab.nature.json')
    .pipe(replace('<!--VLAB REST API URL-->', initObj.settings.VLabsREST))
    .pipe(gulpif(!initObj.naturePlain, cryptojs({algorithm: 'AES', action: 'encrypt', key: initObj.settings.VLabNaturePassPhrase})))
    .pipe(gulp.dest('./build/' + initObj.vLabName + '/resources'));
});

gulp.task('vlab-scene-nature-process', function (done) {
    fs.readdirSync('./src/vlabs/' + initObj.vLabName + '/scenes')
    .filter(function(sceneDir) {
        gulp.src('./src/vlabs/' + initObj.vLabName + '/scenes/' + sceneDir + '/resources/vlab.scene.nature.json')
        .pipe(gulpif(initObj.zipGLTF, replace('.gltf', '.gltf.zip')))
        .pipe(gulpif(!initObj.naturePlain, cryptojs({algorithm: 'AES', action: 'encrypt', key: initObj.settings.VLabNaturePassPhrase})))
        .pipe(gulp.dest('./build/' + initObj.vLabName + '/scenes/' + sceneDir + '/resources'));
    });
    done();
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

gulp.task('clean-css', function (done) {
    if (initObj.mode != 'prod') {
        done();
    } else {
        return gulp.src('./build/**/*.css')
        .pipe(cleancss())
        .pipe(gulp.dest('./build'));
    }
});

gulp.task('build', gulp.series('sync-vlab-assets', 
                               'sync-vlab-items',
                               'vlab-sync-files',
                               'vlab-zip-gltf',
                               'clean-css',
                               'vlab-nature-process',
                               'vlab-scene-nature-process',
                                function transpiling () {
    var devIgnore = [];
    if (initObj.mode == 'prod') {
        fs.readdirSync('./src/vlab.fwk/aux/dev')
        .filter(function(devFile) {
            devIgnore.push('./src/vlab.fwk/aux/dev/' + devFile);
        });
    }

    return browserify('./src/vlabs/' + initObj.vLabName + '/index.js')
    .transform('babelify', { presets: ['@babel/preset-env'] })
    .ignore(devIgnore)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(replace('<!--VLAB NATURE PASSPHRASE-->', (!initObj.naturePlain) ? initObj.settings.VLabNaturePassPhrase : ''))
    .pipe(replace('<!--VLAB AUTH REQUIRED-->', process.argv.indexOf('--noauth') == -1 ? 'true' : 'false'))
    .pipe(replace('<!--VLAB PROD MODE-->', initObj.mode == 'prod' ? 'true' : 'false'))
    .pipe(gulpif(initObj.mode != 'prod', sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(initObj.mode != 'prod', sourcemaps.write('./maps')))
    .pipe(gulpif(initObj.mode == 'prod', replace(/<dev>(.+?)<\/dev>/msig, '')))
    .pipe(gulpif(initObj.mode == 'prod', replace(/console.log\((.+?)\);/msig, '')))
    .pipe(gulpif(initObj.mode == 'prod', minify({
            mangle: false
        }
    )))
    .pipe(gulp.dest('./build/' + initObj.vLabName))
    .on('end', function() {
        if (initObj.mode == 'prod') {
            gulp.src('./build/' + initObj.vLabName + '/bundle-min.js')
            .pipe(rename('bundle.js'))
            .pipe(gulp.dest('./build/' + initObj.vLabName));

            del('./build/' + initObj.vLabName + '/bundle-min.js');
        }

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
    if (process.argv.indexOf('--zip-gltf') > -1) {
        initObj.zipGLTF = true;
    } else {
        initObj.zipGLTF = false;
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