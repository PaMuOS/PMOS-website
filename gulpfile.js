var gulp = require('gulp')
  , gutil = require('gulp-util')
  , browserify = require('browserify')
  , uglify = require('gulp-uglify')
  , concat = require('gulp-concat')
  , runSequence = require('run-sequence')
  , source = require('vinyl-source-stream')
  , path = require('path')

var watcher = gulp.watch(['./frontend/main.js', './frontend/src/*.js'], ['default'])
watcher.on('change', function(event) {
  console.log('File '+event.path+' was '+event.type+', running tasks...')
})

gulp.task('browserify', function() {
  return browserify({ entries: './frontend/main.js' })
    .bundle()
    .on('error', gutil.log)
    .pipe(source('browserified.js'))
    .pipe(gulp.dest('./tmp'))
})

gulp.task('bundle', function() {
  return gulp.src([
      './frontend/deps/*.js',
      './tmp/browserified.js'
    ])
    .pipe(concat('passiomusicae.js', { newLine: ';' }))
    .pipe(gulp.dest('./tmp'))
})

gulp.task('copy', function(done) {
  return gulp.src('./tmp/passiomusicae.js')
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('uglify', function() {
  return gulp.src('./tmp/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('common', function(done) {
  runSequence('browserify', 'bundle', done)
})

gulp.task('default', function(done) {
  runSequence('common', 'copy', done)
})

gulp.task('build', function(done) {
  runSequence('common', 'uglify', done)
})