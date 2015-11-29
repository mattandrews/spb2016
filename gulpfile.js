var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    plumber = require('gulp-plumber'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    autoprefixer = require('gulp-autoprefixer'),
    RevAll = require('gulp-rev-all');

var folders = {
    assets: {
        sass: './assets/sass/',
        javascript: './assets/js/',
        images: './assets/img/'
    },
    public: {
        javascript: './public/js/',
        css: './public/css/',
        images: './public/img/'
    }
};

gulp.task('clean', function () {
    return del([
        folders.public.css,
        folders.public.javascript,
        folders.public.images,
        './public/dist/'
    ]);
});

gulp.task('copy', function () {
    return gulp.src(folders.assets.images + '**/*.*').pipe(gulp.dest(folders.public.images));
});

gulp.task('sass', function () {
    gulp.src(folders.assets.sass + '**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat('app.css'))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(folders.public.css))
    .pipe(livereload());
});

gulp.task('javascript', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: folders.assets.javascript + 'entry.js',
        debug: true
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(folders.public.javascript));
});

gulp.task('rev', function () {
    var revAll = new RevAll({
      fileNameManifest: 'assets.json',
      debug: true
    });
    gulp.src('./public/**/*.*')
        .pipe(revAll.revision())
        .pipe(gulp.dest('./public/dist'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('./public/dist'));
});

gulp.task('watch', function() {
    gulp.watch(folders.assets.sass + '**/*.scss', ['sass', 'rev']);
    gulp.watch(folders.assets.javascript + '**/*.js', ['javascript', 'rev']);
});

gulp.task('develop', function () {
    livereload.listen();
    nodemon({
        script: 'bin/www',
        ext: 'js nunjucks coffee',
        stdout: false
    }).on('readable', function () {
        this.stdout.on('data', function (chunk) {
            if(/^Express server listening on port/.test(chunk)){
                livereload.changed(__dirname);
            }
        });
        this.stdout.pipe(process.stdout);
        this.stderr.pipe(process.stderr);
    });
});

gulp.task('default', [
    'clean',
    'copy',
    'sass',
    'javascript',
    'develop',
    'watch'
]);
