var path = require('path')
  , browserify = require('browserify')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , less = require('gulp-less')
  , uglify = require('gulp-uglify')
  , concat = require('gulp-concat')
  , runSequence = require('run-sequence')
  , source = require('vinyl-source-stream')

var watcher = gulp.watch(['./frontend/*.js', './frontend/style.less', './frontend/src/**/*.js'], ['default'])
/*watcher.on('change', function(event) {
  console.log('File '+event.path+' was '+event.type+', running tasks...')
})*/

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

gulp.task('less', function () {
  return gulp.src('./frontend/style.less')
    .pipe(less())
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('common', function(done) {
  runSequence('browserify', 'bundle', 'less', done)
})

gulp.task('default', function(done) {
  runSequence('common', 'copy', done)
})

gulp.task('build', function(done) {
  runSequence('common', 'uglify', done)
})