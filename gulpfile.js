var gulp = require("gulp");
var typedoc = require("gulp-typedoc");

gulp.task("typedoc", function() {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "docs/typedoc",
            name: "matchmaker-ts"
        }))
    ;
});
