var gulp                = require("gulp");
var dirSync             = require("gulp-directory-sync");

gulp.task("sync-vlabs-assets", function() {
    return gulp.src("")
        .pipe(dirSync("./vlabs.assets", "../build/vlabs.assets", { 
            ignore: [],
            printSummary: true
        }));
});

gulp.task("default", ["sync-vlabs-assets"]);