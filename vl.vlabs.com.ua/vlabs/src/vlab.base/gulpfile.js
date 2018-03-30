var gulp                = require("gulp");
var dirSync             = require("gulp-directory-sync");
var connect             = require("gulp-connect");
var browserify          = require("browserify");
var babelify            = require("babelify");
var source              = require("vinyl-source-stream");
var buffer              = require("vinyl-buffer");
var uglify              = require("gulp-uglify");
var sourcemaps          = require("gulp-sourcemaps");
var purgeSourcemaps     = require("gulp-purge-sourcemaps");
var gutil               = require("gulp-util");
var cors                = require('cors');
var obfuscator          = require('gulp-javascript-obfuscator');
var base64_encode       = require('gulp-base64-encode');
var replace             = require('gulp-replace');
var fs                  = require('fs');

var vLabName = __dirname.substr(__dirname.lastIndexOf("/") + 1);

gulp.task("build-prod", ["sync"], function () {
    console.log("VLab directory name: " + vLabName);
    return browserify({
        entries: [
            "./index.js"
        ],
        debug: false
    })
    .transform("babelify", { presets: ["es2015"] })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(obfuscator())
    .on("error", function (err) { gutil.log(gutil.colors.red("[Error]"), err.toString()); })
    .pipe(gulp.dest("../../build/" + vLabName));
});

gulp.task("build", ["sync"], function () {
    console.log("VLab directory name: " + vLabName);
    return browserify({
        entries: [
            "./index.js"
        ],
        debug: true
    })
    .transform("babelify", { presets: ["es2015"] })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(purgeSourcemaps())
    // .pipe(sourcemaps.write("/dev/null", {addComment: false}))
    .pipe(sourcemaps.write("./maps"))
    .pipe(gulp.dest("../../build/" + vLabName));
});

gulp.task("sync", ["vlab-nature-encode", "sync-vlab-items", "sync-vlabs-assets"], function() {
    return gulp.src("")
        .pipe(dirSync("./", "../../build/" + vLabName, { 
            ignore: [
                "gulpfile.js",
                "index.js",
                "./resources/nature.json"
            ],
            printSummary: true
        }));
});

gulp.task("sync-vlabs-assets", function() {
    return gulp.src("")
        .pipe(dirSync("../vlabs.assets", "../../build/vlabs.assets", { 
            ignore: [],
            printSummary: true
        }));
});

gulp.task("sync-vlab-items", function() {
    return gulp.src("")
        .pipe(dirSync("../vlabs.items", "../../build/vlabs.items", { 
            ignore: ["index.js"],
            printSummary: true
        }));
});

gulp.task("watch", ["build"], function () {
    gulp.watch(["./**/*.js",
                "./**/*.json",
                "./**/*.html",
                "../vlabs.core/**/*.*",
                "../vlabs.items/**/*.*",
                "../vlabs.assets/**/*.*"
                ], ["build"]);
});

//Start a test server with doc root at build folder and 
//listening to 9001 port. Home page = http://localhost:9001
gulp.task("server", function(){
    connect.server({
        root : "../../build",
        livereload : false,
        port : 9001,
        host: "0.0.0.0",
        middleware: function() {
            return [cors()];
        }
    });
});

gulp.task("vlab-nature-encode", function () {
    if (process.argv.indexOf("--noauth") > -1) {
        gulp.src("./resources/nature.json")
            .pipe(replace('"VLabsREST": "http://localhost:8090/api"', '"VLabsREST": null'))
            .pipe(base64_encode())
            .pipe(gulp.dest("../../build/" + vLabName + "/resources"));
    } else {
        gulp.src("./resources/nature.json")
            .pipe(base64_encode())
            .pipe(gulp.dest("../../build/" + vLabName + "/resources"));
    }
});

gulp.task("sync-vlabs", function () {
    var packageJSON = JSON.parse(fs.readFileSync('../../package.json'));
    console.log(packageJSON.VLabsREST);
    return gulp.src("")
        .pipe(dirSync("../../build/" + vLabName, "../../../../rest.vlabs.com.ua/bin/static/vlabs/" + vLabName, { 
            ignore: ["index.js"],
            printSummary: true
        }));
});

gulp.task("default", ["build", "server", "watch"]);
gulp.task("prod", ["build-prod"]);
gulp.task("run", ["server"]);