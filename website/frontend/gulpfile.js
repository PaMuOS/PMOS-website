var gulp = require('gulp')
  , gutil = require('gulp-util')
  , browserify = require('browserify')
  , concat = require('gulp-concat')
  , runSequence = require('run-sequence')
  , source = require('vinyl-source-stream')
  , path = require('path')

var watcher = gulp.watch(['./index.js', './src/*.js'], ['default'])
watcher.on('change', function(event) {
  console.log('File '+event.path+' was '+event.type+', running tasks...')
})

gulp.task('browserify', function() {
  return browserify({ entries: './index.js' })
    .bundle()
    .on('error', gutil.log)
    .pipe(source('browserified.js'))
    .pipe(gulp.dest('./build'))
})

gulp.task('bundle', function() {
  return gulp.src([
      './deps/*.js',
      './build/rhizome.js',
      './build/browserified.js'
    ])
    .pipe(concat('passiomusicae.js', { newLine: ';' }))
    .pipe(gulp.dest('./build'))
})

gulp.task('copy', function(done) {
  return gulp.src('./build/passiomusicae.js')
    .pipe(gulp.dest('../dist/js'))
})

/*
gulp.task('uglify', function() {
  return gulp.src('./build/')
    .pipe(uglify())
    .pipe(gulp.dest('./build/'))
})
*/

gulp.task('common', function(done) {
  runSequence('browserify', 'bundle', done)
})

gulp.task('default', function(done) {
  runSequence('common', 'copy', done)
})

gulp.task('build', function(done) {
  runSequence('common', 'uglify', done)
})