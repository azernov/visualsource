// plugins for development
var gulp = require('gulp'),
    rimraf = require('rimraf'),
    gulprimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    inlineimage = require('gulp-inline-image'),
    prefix = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    dirSync = require('gulp-directory-sync'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    postcss = require('gulp-postcss'),
    assets  = require('postcss-assets'),
    print = require('gulp-print').default,
    rename = require('gulp-rename');

// plugins for build
var uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    csso = require('gulp-csso');

var assetsDir = 'assets/';
var productionDir = '../www/assets/components/omtestimonials/';

//----------------------------------------------------Compiling

gulp.task('sass', function () {
    return gulp.src([assetsDir + 'sass/**/*.scss', '!' + assetsDir + 'sass/**/_*.scss'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(inlineimage())
        .pipe(prefix('last 3 versions'))
        .pipe(postcss([assets({
            basePath:productionDir,
            loadPaths: ['i/']
        })]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(productionDir + 'styles/'))
        .pipe(print(function(p){
            return "!!!DON'T FORGET RUN cssBuild!!!";
        }));
});

//----------------------------------------------------Compiling###

//-------------------------------------------------Synchronization
gulp.task('imageSync', function () {
    return gulp.src(assetsDir + 'i/**')
        .pipe(plumber())
        .pipe(gulp.dest(productionDir + 'i/'))
        .pipe(print(function(p){
            return "!!!DON'T FORGET RUN imgBuild!!!";
        }));
});

gulp.task('fontsSync', function () {
    return gulp.src(assetsDir + 'fonts/**/*')
        .pipe(gulp.dest(productionDir + 'fonts/'))
});

gulp.task('jsSync', function () {
    return gulp.src([assetsDir + 'js/**/*.js'])
        .pipe(plumber())
        .pipe(gulp.dest(productionDir + 'js/'))
        .pipe(print(function(p){
            return "!!!DON'T FORGET RUN jsBuild!!!";
        }));
});
//-------------------------------------------------Synchronization###


//watching files and run tasks
gulp.task('watch', function (done) {
    gulp.watch(assetsDir + 'sass/**/*.scss', gulp.series('sass'));
    gulp.watch([assetsDir + 'js/**/*.js','!' + assetsDir + 'js/all/**/*.js'], gulp.series('jsSync'));
    gulp.watch(assetsDir + 'i/**/*', gulp.series('imageSync'));
    gulp.watch(assetsDir + 'fonts/**/*', gulp.series('fontsSync'));
    done();
});



//copy and minify js
gulp.task('jsBuild', function () {
    return gulp.src([productionDir + 'js/**/*.js','!'+productionDir + 'js/**/*.min.js'])
        .pipe(uglify())
        .pipe(rename(function(path){
            path.extname = '.min.js';
        }))
        .pipe(gulp.dest(productionDir + 'js/'))
});

//copy, minify css
gulp.task('cssBuild', function () {
    return gulp.src([productionDir + 'styles/**/*.css','!' + productionDir + 'styles/**/*.min.css'])
    //.pipe(purify([productionDir + 'js/**/*', outputDir + '**/*.html']))
        .pipe(csso())
        .pipe(rename(function(path){
            path.extname = '.min.css';
        }))
        .pipe(gulp.dest(productionDir + 'styles/'))
});

//// --------------------------------------------If you need iconfont
// var iconfont = require('gulp-iconfont'),
// 	iconfontCss = require('gulp-iconfont-css'),
// 	fontName = 'iconfont';
// gulp.task('iconfont', function () {
// 	gulp.src([assetsDir + 'i/icons/*.svg'])
// 		.pipe(iconfontCss({
// 			path: 'assets/sass/templates/_icons_template.scss',
// 			fontName: fontName,
// 			targetPath: '../../sass/_icons.scss',
// 			fontPath: '../fonts/icons/',
// 			svg: true
// 		}))
// 		.pipe(iconfont({
// 			fontName: fontName,
// 			svg: true,
// 			formats: ['svg','eot','woff','ttf']
// 		}))
// 		.pipe(gulp.dest('assets/fonts/icons'));
// });

//--------------------------------------------If you need svg sprite
var svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

gulp.task('svgSpriteBuild', function () {
    return gulp.src(assetsDir + 'i/icons/*.svg')
    // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // remove all fill and style declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        // cheerio plugin create unnecessary string '&gt;', so replace it.
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg",
                    render: {
                        scss: {
                            dest:'../../../sass/_sprite.scss',
                            template: assetsDir + "sass/templates/_sprite_template.scss"
                        }
                    },
                    example: true
                }
            }
        }))
        .pipe(gulp.dest(assetsDir + 'i/sprite/'));
});

gulp.task('default', gulp.series('sass', 'imageSync', /*'fontsSync',*/ 'jsSync', 'watch'));