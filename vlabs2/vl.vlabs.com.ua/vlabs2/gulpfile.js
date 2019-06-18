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
const rimraf                = require("rimraf");
const recursivecopy         = require('recursive-copy');
const preprocessify         = require('preprocessify');
const glob                  = require('glob'); 

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
        ignore: function(dir, file) {

            let gulpIgnores = [];
            if (fs.existsSync(dir + '/gulp.ignore')) {
                let gulpIgnoreContent = fs.readFileSync(dir + '/gulp.ignore', 'utf-8');
                gulpIgnores = gulpIgnoreContent.split('\n');
            }

            if ((new RegExp('.js$')).test(file)) return true;
            if (file == 'gulp.ignore') return true;
            if (gulpIgnores.indexOf(file) > -1) return true;
        },
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
    .transform(preprocessify, {
        includeExtensions: ['.js'],
        context: { LOADER3D : initObj.loader3D }
    })
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

gulp.task('create', function (done) {
    if (process.argv.indexOf('--usage') != -1) {
        console.log('Usage:\n');
        console.log('gulp create \n\
        --vlab-alias {group.vlab.name} \n\
        --vlab-name {\'human readable VLab name\'} \n\
        [--rmdir (removes VLab directory if exists)] \n\
        [--gitignore (adds VLab directory to ./src/.gitignore)]\n\
        ');
        done();
        process.exit();
    }

    console.log(color('Creating new VLab project...', 'YELLOW'));
    var vLabProject = {};
    var errors = [];

    if (process.argv.indexOf('--vlab-alias') == -1) {
        errors.push(color('--vlab-alias argument is missing!', 'RED'));
    } else {
        vLabProject.alias = process.argv[process.argv.indexOf('--vlab-alias') + 1];
        let specialCharactersInAlias = vLabProject.alias.match(/.*[,\/\s\^\!;&`'"%:?*()=\\~@\t].*/ig);
        if (specialCharactersInAlias) {
            errors.push(color('--vlab-alias contains special character(s).', 'RED'));
        }

        let vLabGroupEndIndex = vLabProject.alias.indexOf('.');
        vLabProject.group = vLabProject.alias.substring(0, vLabGroupEndIndex);
        vLabProject.designation = vLabProject.alias.substring(vLabGroupEndIndex + 1);
        
        let designationParts = vLabProject.alias.split('.');
        vLabProject.baseClass = '';
        designationParts.forEach(designationPart => {
            vLabProject.baseClass += designationPart.charAt(0).toLocaleUpperCase() + designationPart.slice(1);
        });

        vLabProject.path = './src/vlabs/' + vLabProject.alias;
        if (fs.existsSync(vLabProject.path)) {
            if (process.argv.indexOf('--rmdir') != -1) {
                console.log(color('Directory [' + vLabProject.path + '] attempt to remove...', 'YELLOW'));
                rimraf.sync(vLabProject.path);
                console.log(color('Directory [' + vLabProject.path + '] removed', 'BLUE'));
            } else {
                errors.push(color('VLab project could not be created! Directory [' + vLabProject.path + '] already exists.', 'RED'));
            }
        }
    }
    if (process.argv.indexOf('--vlab-name') == -1) {
        errors.push(color('--vlab-name argument is missing!', 'RED'));
    } else {
        vLabProject.name = process.argv[process.argv.indexOf('--vlab-name') + 1];
    }
    /**
     * 
     * If any errors in arguments
     * 
     */
    if (errors.length > 0) {
        for (error of errors) {
            console.log(error);
        }
        process.exit();
    }

    console.log(vLabProject);

    fs.mkdirSync(vLabProject.path);
    console.log(color('VLab poroject [' + vLabProject.name + '] directory has been created under the path [' + vLabProject.path + '].', 'GREEN'));

    /**
     * VLab Project basic structure
     */

    /**
     * VLab "resources" directory
     */
    fs.mkdirSync(vLabProject.path + '/resources');

    fs.copyFileSync('./src/vlab.fwk/utils/vlab.project.structure/resources/icon.png', vLabProject.path + '/resources/icon.png');
    fs.copyFileSync('./src/vlab.fwk/utils/vlab.project.structure/resources/thumbnail.jpg', vLabProject.path + '/resources/thumbnail.jpg');

    /**
     * resources/vlab.nature.json <- from ./src/vlab.fwk/utils/vlab.project.structure/resources/vlab.nature.jsont
     */
    let vlab_nature_json = fs.readFileSync('./src/vlab.fwk/utils/vlab.project.structure/resources/vlab.nature.jsont', 'utf8');
    /**
     * Susbsitutes in vlab.nature.jsont
     */
    vlab_nature_json = vlab_nature_json.replace(/@@VLAB_NAME@@/g, vLabProject.name);

    fs.writeFileSync(vLabProject.path + '/resources/vlab.nature.json', vlab_nature_json);

    /**
     * VLab "scenes" directory
     */
    fs.mkdirSync(vLabProject.path + '/scenes');
    recursivecopy('./src/vlab.fwk/utils/vlab.project.structure/scenes/base.scene', vLabProject.path + '/scenes/base.scene');


    /**
     * root directory
     */
    /**
     * index.html <- from index.htmlt
     */
    let index_htmlt = fs.readFileSync('./src/vlab.fwk/utils/vlab.project.structure/index.htmlt', 'utf8');
    fs.writeFileSync(vLabProject.path + '/index.html', index_htmlt);

    /**
     * index.js <- from ./src/vlab.fwk/utils/vlab.project.structure/index.jst
     */
    let index_jst = fs.readFileSync('./src/vlab.fwk/utils/vlab.project.structure/index.jst', 'utf8');
    /**
     * Susbsitutes in index.jst
     */
    index_jst = index_jst.replace(/@@VLAB_GROUP@@/g, vLabProject.group);
    index_jst = index_jst.replace(/@@VLAB_ALIAS@@/g, vLabProject.alias);
    index_jst = index_jst.replace(/@@VLAB_DESIGNATION@@/g, vLabProject.designation);
    index_jst = index_jst.replace(/@@VLAB_NAME@@/g, vLabProject.name);
    index_jst = index_jst.replace(/@@THIS_VLAB_CLASS_NAME@@/g, vLabProject.baseClass);

    fs.writeFileSync(vLabProject.path + '/index.js', index_jst);

    if (process.argv.indexOf('--gitignore') != -1) {
        let gitignore = fs.readFileSync('./src/vlabs/.gitignore', 'utf8');
        if (gitignore.indexOf(vLabProject.alias) == -1) {
            gitignore += '\n' + vLabProject.alias;
            fs.writeFileSync('./src/vlabs/.gitignore', gitignore);
        }
    }

    console.log('\nLaunch command:\n');
    console.log('gulp --vlab ' + vLabProject.alias + ' --mode dev --noauth');
    console.log('\n');

    done();
});

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
    initObj.loader3D = 'GLTFLoader';
    if (process.argv.indexOf('--loader3D') > -1) {
        initObj.loader3D =  process.argv[process.argv.indexOf('--loader3D') + 1];
    }
    console.log(color('Using ' + initObj.loader3D, 'YELLOW'));
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

    let watchIgnoreList = [];
    /**
     * VLab Items
     */
    glob('./src/vlab.items/**', function(err, vlabItemsFiles) {
        vlabItemsFiles.forEach((vlabItemFile) => {
            if (vlabItemFile.indexOf('gulp.watch.igore') > -1) {
                let gulpWatchIgnoreContent = fs.readFileSync(vlabItemFile, 'utf-8');
                let gulpWatchIgnores = gulpWatchIgnoreContent.split('\n');
                gulpWatchIgnores.forEach(gulpWatchIgnore => {
                    if (gulpWatchIgnore.length > 0) {
                        watchIgnoreList.push('!' + gulpWatchIgnore);
                    }
                });
            }
        });

        let watchList = ['./src/vlabs/' + initObj.vLabName + '/**/*.js',
                    './src/vlabs/' + initObj.vLabName + '/**/*.json',
                    './src/vlabs/' + initObj.vLabName + '/**/*.html',
                    './src/vlabs/' + initObj.vLabName + '/**/*.css',
                    './src/vlabs/' + initObj.vLabName + '/**/*.appcache',
                    './src/vlab.fwk/**/*.*',
                    './src/vlab.items/**/*.*',
                    './src/vlab.assets/**/*.*'
                    ];
        watchList = [...watchList, ...watchIgnoreList];
        gulp.watch(watchList, gulp.series('build'));
    });
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