'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

gulp.task('sass', function () {
  gulp.src('./scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('js', function () {
  gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/jquery-form/jquery.form.js',
    './js/**/*.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(concat('script.js'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./build/js'));
});

gulp.task('default', ['sass', 'js']);

gulp.task( 'watch', ['default'], function () {
  gulp.watch( './scss/**/*.scss', ['sass'] );
	gulp.watch( './js/**/*.js', ['js'] );
});