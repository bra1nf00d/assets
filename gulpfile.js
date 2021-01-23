// Gulp commands
const { src, dest, parallel, series, watch } = require('gulp');

// folder
let projectFolder = require('path').basename(__dirname),
	sourceFolder = 'app';

// path
let path = {
	app: {
		html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
		scss: sourceFolder + '/scss/**/*.scss',
		// js: [sourceFolder + '/*.js', '!' + sourceFolder + '/_*.js'],
		js: sourceFolder + '/js/script.js',
		img: sourceFolder + '/img/**/*.{jpg,png,gif,ico,webp}',
		svg: sourceFolder + '/img/svg/*.svg',
		font: sourceFolder + '/fonts/**/*.ttf',
		res: sourceFolder + '/resource/**',
	},
	dest: {
		html: projectFolder + '/',
		css: projectFolder + '/css/',
		js: projectFolder + '/js/',
		img: projectFolder + '/img/',
		svg: projectFolder + '/img/svg/',
		font: projectFolder + '/fonts/',
		res: projectFolder + '/',
	},
	watch: {
		html: sourceFolder + '/**/*.html',
		scss: sourceFolder + '/scss/**/*.scss',
		js: sourceFolder + '/js/**/*.js',
		img: sourceFolder + '/img/**/*.{jpg,png,gif,ico,webp}',
		svg: sourceFolder + '/img/svg/*.svg',
		font: sourceFolder + '/fonts/**/*.ttf',
		res: sourceFolder + '/resource/**',
	},
	reload: {
		font: projectFolder + '/fonts/',
		img: projectFolder + '/img/',
	}
}

// vars
var sass = require('gulp-sass'),
	notify = require('gulp-notify'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	prefixer = require('gulp-autoprefixer'),
	cleanCss = require('gulp-clean-css'),
	groupMedia = require('gulp-group-css-media-queries'),
	browserSync = require('browser-sync'),
	fileinclude = require('gulp-file-include'),
	imagemin = require('gulp-imagemin'),
	sprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fs = require('fs'),
	del = require('del'),
	uglify = require('gulp-uglify-es').default;



// function
function html() {
	return src(path.app.html)
		.pipe(fileinclude())
		.pipe(dest(path.dest.html))
		.pipe(browserSync.stream());
}

function css() {
	return src(path.app.scss)
		.pipe(
			sass({
				outputStyle: 'expanded'
			}).on('error', notify.onError()))
		.pipe(groupMedia())
		.pipe(
			prefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true
			}))
		.pipe(dest(path.dest.css))
		.pipe(cleanCss())
		.pipe(
			rename({
				extname: '.min.css'
			}))
		.pipe(dest(path.dest.css))
		.pipe(browserSync.stream());
}

function js() {
	return src(path.app.js)
		.pipe(fileinclude())
		.pipe(dest(path.dest.js))
		.pipe(
			uglify()
		)
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.dest.js))
		.pipe(browserSync.stream());
}

function img() {
	return src(path.app.img)
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3,
			}))
		.pipe(dest(path.dest.img))
}

function svg() {
	return src(path.app.svg)
		.pipe(sprite({
			mode: {
				stack: {
					sprite: '../sprite.svg'
				}
			}
		}))
		.pipe(dest(path.dest.svg))
}

function font() {
	src(path.app.font)
		.pipe(ttf2woff())
		.pipe(dest(path.dest.font))
	return src(path.app.font)
		.pipe(ttf2woff2())
		.pipe(dest(path.dest.font))
}

const checkWeight = (fontname) => {
	let weight = 400;
	switch (true) {
		case /Thin/.test(fontname):
			weight = 100;
			break;
		case /ExtraLight/.test(fontname):
			weight = 200;
			break;
		case /Light/.test(fontname):
			weight = 300;
			break;
		case /Regular/.test(fontname):
			weight = 400;
			break;
		case /Medium/.test(fontname):
			weight = 500;
			break;
		case /SemiBold/.test(fontname):
			weight = 600;
			break;
		case /Semi/.test(fontname):
			weight = 600;
			break;
		case /Bold/.test(fontname):
			weight = 700;
			break;
		case /ExtraBold/.test(fontname):
			weight = 800;
			break;
		case /Heavy/.test(fontname):
			weight = 700;
			break;
		case /Black/.test(fontname):
			weight = 900;
			break;
		default:
			weight = 400;
	}
	return weight;
}

const cb = () => { }
let srcFonts = './' + sourceFolder + '/scss/_fonts.scss';
let appFonts = './' + projectFolder + '/fonts/';

function fontsStyle(done) {
	let file_content = fs.readFileSync(srcFonts);

	fs.writeFile(srcFonts, '', cb);
	fs.readdir(appFonts, function (err, items) {
		if (items) {
			let c_fontname;
			for (var i = 0; i < items.length; i++) {
				let fontname = items[i].split('.');
				fontname = fontname[0];
				let font = fontname.split('-')[0];
				let weight = checkWeight(fontname);
				if (c_fontname != fontname) {
					fs.appendFile(srcFonts, '@include font-face("' + font + '", "' + fontname + '", ' + weight + ');\r\n', cb);
				}
				c_fontname = fontname;
			}
		}
	})
	done();
}

/* (!) TERMINAL: gulp res */
function res() {
	return src(path.app.res)
		.pipe(dest(path.dest.res))
}

// Reload
function clean() {
	return del('./' + projectFolder + '/')
}

function fontReload() {
	return del(path.reload.font)
}

function imgReload() {
	return del(path.reload.img)
}

function target() {
	browserSync.init({
		server: {
			baseDir: './' + projectFolder
		},
		port: 3000,
		notify: false
	});
	watch(path.watch.scss, css);
	watch(path.watch.html, html);
	watch(path.watch.js, js);
	// watch(path.watch.img, img);
	// watch(path.watch.svg, svg);
	watch(path.watch.img, series(imgReload, parallel(img), svg, html));
	watch(path.watch.svg, series(imgReload, parallel(img), svg, html));
	watch(path.watch.font, series(fontReload, parallel(font), fontsStyle, css));
	// watch(path.watch.font, fontsStyle);
}


// Вызов
exports.target = target;
exports.res = res;
exports.html = html;
exports.css = css;
exports.js = js;

exports.default = series(clean, parallel(html, font, img, svg, res), fontsStyle, css, js, target)