/* by bra1nf00d */
// Gulp import
const {src, dest, parallel, series, watch} = require('gulp');


// Folder
let project = require('path').basename(__dirname),
    source = 'app';


// Path
let path = {
    app: {
        html: [source + '/*.html', '!' + source + '/_*.html'],
        scss: source + '/scss/**/*.scss',
        js: source + '/js/script.js',
        img: source + '/src/*.{jpg,jpeg,png,gif,ico,svg,webp}',
        fonts: source + '/src/*.ttf',
        video: source + '/src/*.{webm,mp4}',
        php: source + '/src/*.php',
        resource: {
            css: [source + '/src/**/all.css',
                source + '/src/**/all.min.css',
                source + '/src/**/style.css',
                source + '/src/**/style.min.css',
                source + '/src/**/slick.css',
                source + '/src/**/slick.min.css'],
            js: [source + '/src/**/all.js',
                source + '/src/**/all.min.js',
                source + '/src/**/script.js',
                source + '/src/**/script.min.js',
                source + '/src/**/slick.js',
                source + '/src/**/slick.min.js',],
        }
    },
    dest: {
        html: project + '/',
        css: project + '/css/',
        js: project + '/js/',
        img: project + '/img/',
        fonts: project + '/fonts/',
        video: project + '/video/',
        php: project + '/',
        resource: {
            css: project + '/css/',
            js: project + '/js/',
        }
    },
    watch: {
        html: source + '/*.html',
        scss: source + '/scss/**/*.scss',
        js: source + '/js/**/*.js',
        img: source + '/src/*.{jpg,jpeg,png,gif,ico,svg,webp}',
        fonts: source + '/src/*.ttf',
        video: source + '/src/*.{webm,mp4}',
        php: source + '/src/*.php',
        libs: source + '/src/',
        resource: {
            css: [source + '/src/**/all.css',
                source + '/src/**/all.min.css',
                source + '/src/**/style.css',
                source + '/src/**/style.min.css',
                source + '/src/**/slick.css',
                source + '/src/**/slick.min.css',],
            js: [source + '/src/**/all.js',
                source + '/src/**/all.min.js',
                source + '/src/**/script.js',
                source + '/src/**/script.min.js',
                source + '/src/**/slick.js',
                source + '/src/**/slick.min.js',],
        }
    },
    error: {
        html: source + '/index.html',
        scss: source + '/scss/style.scss',
        js: source + '/js/script.js',
    },
}


// Vars
let browserSync = require('browser-sync'),
    fs = require('fs'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    prefix = require('gulp-autoprefixer'),
    cleanCss = require('gulp-clean-css'),
    mediaCss = require('gulp-group-css-media-queries'),
    uglify = require('gulp-uglify-es').default,
    minifyImg = require('gulp-imagemin'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    stylelint = require('gulp-stylelint'),
    copydir = require('copy-dir');

// Function
function html() {
    if (!fs.existsSync(path.error.html)) console.log('\n[ERROR] "index.html" is not found\n');
    return src(path.app.html)
        .pipe(fileinclude())
        .pipe(dest(path.dest.html))
        .pipe(browserSync.stream())
}

function css() {
    if (!fs.existsSync(path.error.scss)) console.log('\n[ERROR] "style.scss" is not found\n');
    return src(path.app.scss)
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', notify.onError()))
        .pipe(stylelint({
            fix: true,
            failAfterError: false,
            reporters: [
                {
                    formatter: 'string',
                    console: true,
                },
            ],
        }))
        .pipe(mediaCss())
        .pipe(prefix({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(dest(path.dest.css))
        .pipe(cleanCss())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.dest.css))
        .pipe(browserSync.stream())
}

function js() {
    if (!fs.existsSync(path.error.js)) console.log('\n[ERROR] "script.js" is not found\n')
    return src(path.app.js)
        .pipe(fileinclude())
        .pipe(dest(path.dest.js))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(dest(path.dest.js))
        .pipe(browserSync.stream())
}

function img() {
    del(project + '/img/')
    return src(path.app.img)
        .pipe(minifyImg({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 2,
        }))
        .pipe(dest(path.dest.img))
}

function fonts() {
    src(path.app.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.dest.fonts))
    return src(path.app.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.dest.fonts))
}

function video() {
    del(project + '/video/')
    return src(path.app.video)
        .pipe(dest(path.dest.video))
}

function php() {
    del(project + '/*.php')
    return src(path.app.php)
        .pipe(dest(path.dest.php))
}

function resource() {
    src(path.app.resource.css)
        .pipe(rename(function (path) {
            path.extname = '/../../';
        }))
        .pipe(rename({
            extname: '.css'
        }))
        .pipe(dest(path.dest.resource.css))
    return src(path.app.resource.js)
        .pipe(rename(function (path) {
            path.extname = '/../../';
        }))
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(dest(path.dest.resource.js))
}

// Watch
function tracker() {
    browserSync.init({
        server: {
            baseDir: './' + project
        },
        port: 3000,
        notify: true,
    });

    watch(path.watch.html, html);
    watch(path.watch.scss, css);
    watch(path.watch.js, js);

    watch(path.watch.img, series(img, html));
    watch(path.watch.fonts, series(delFont, fonts, scssFont));
    watch(path.watch.video, video);
    watch(path.watch.php, php);

    watch(path.watch.resource.css, resource);
    watch(path.watch.resource.js, resource);
    watch(path.watch.libs, libs);
}

// Clean
function clean() {
    return del('./' + project + '/')
}

function git() {
    return del('./' + source + '/**/.gitignore')
}

// Exports
exports.tracker = tracker;
exports.html = html;
exports.css = css;
exports.js = js;

// Run
const refine = series(git, clean);

exports.default = series(refine, parallel(html, fonts, img, video, php),
    scssFont, css, js, libs, resource, tracker);


// Second Function
function delFont() {
    return del(project + '/fonts/');
}

function scssFont(done) {
    let src = './' + source + '/scss/',
        dest = './' + project + '/fonts/';

    try {
        if (fs.existsSync(dest)) {
            if (fs.existsSync(src + '_font.scss')) {
                console.log('[WARNING] "font-scss" files were rewrited');
                fillFont();
            } else {
                console.log('[WARNING] "font-scss" files were created');
                fillFont();
                fs.writeFile(src + '_font-face.scss',
                    '@mixin font-face($font-family, $url, $weight) {\n' +
                    '\t@font-face {\n' +
                    '\t\tfont-family: "#{$font-family}";\n' +
                    '\t\tsrc: url("../fonts/#{$url}.woff2") format("woff2");\n' +
                    '\t\tfont-weight: #{$weight};\n' +
                    '\t\tfont-display: swap;\n' +
                    '\t\tfont-style: normal;\n' +
                    '\t}\n' +
                    '}\n', cb);
            }
        } else {
            console.log('[WARNING] "font-пscss" files were deleted');
            if (fs.existsSync(src + '_font.scss' || src + '_font-face.scss')) {
                fs.unlink(src + '_font.scss', err => {
                    if (err) throw err
                });
                fs.unlink(src + '_font-face.scss', err => {
                    if (err) throw err
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
    done();
}

function weightFont(font) {
    let weight = 400;
    switch (true) {
        case /Thin/.test(font):
            weight = 100;
            break;
        case /ExtraLight/.test(font):
            weight = 200;
            break;
        case /Light/.test(font):
            weight = 300;
            break;
        case /Regular/.test(font):
            weight = 400;
            break;
        case /Medium/.test(font):
            weight = 500;
            break;
        case /SemiBold/.test(font):
            weight = 600;
            break;
        case /Semi/.test(font):
            weight = 600;
            break;
        case /Bold/.test(font):
            weight = 700;
            break;
        case /ExtraBold/.test(font):
            weight = 800;
            break;
        case /Heavy/.test(font):
            weight = 700;
            break;
        case /Black/.test(font):
            weight = 900;
            break;
        default:
            weight = 400;
    }
    return weight;
}

function fillFont() {
    let src = './' + source + '/scss/',
        dest = './' + project + '/fonts/';

    fs.writeFile(src + '_font.scss', '', cb);
    fs.readdir(dest, function (err, file) {
        if (file) {
            let copy_font;
            for (let i = 0; i < file.length; i++) {
                let font = file[i].split('.');
                font = font[0];
                let name = font.split('-')[0];
                let weight = weightFont(font);
                if (copy_font != font) {
                    fs.appendFile(src + '_font.scss', '@include font-face("' + name + '", "' + font + '", ' + weight + ');\r\n', cb);
                }
                copy_font = font;
            }
        }
    });
}

function cb() {
}

function libs(done) {
    let src = './' + source + '/src/',
        dest = './' + project + '/';

    try {
        fs.readdir(src, function (err, file) {
            for (let i = 0; i < file.length; i++) {
                let folder = file[i].split('').join('');
                let separator = file[i].split('')[0];
                if (folder === separator + folder.split('_').join('')) {
                    let name = folder.split('_').join('');
                    copydir(src + folder, dest + name, err => {
                        if (err) console.log(err);
                    });
                    console.log('[WARNING] ' + folder + ' was copied');
                }
            }
        });
    } catch (err) {
        console.log(err);
    }

    done();
}