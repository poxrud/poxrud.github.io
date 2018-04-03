var gulp = require('gulp'),
    autoprefixer = require('autoprefixer'),
    postcss      = require('gulp-postcss');

gulp.task('default', function() {
  console.log("test");
});

gulp.task('css', function() {
  return gulp.src('_site/css/main.css', {base: './'})
    .pipe(postcss([
      require('postcss-flexbugs-fixes'),
      autoprefixer()
    ]))
    .pipe(gulp.dest('./'));
});