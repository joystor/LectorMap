'use strict';
var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var stylus = require('gulp-stylus');
var minify = require('gulp-minify');
var minifyCSS = require('gulp-minify-css');
var $ = require('gulp-load-plugins')({lazy: true});
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var template = require('gulp-underscore-template');
var replace = require('gulp-replace');
var nib = require('nib');


function log(msg) {
	if (typeof(msg) === 'object') {
		for (var item in msg) {
			if (msg.hasOwnProperty(item)) {
				$.util.log($.util.colors.green(msg[item]));
			}
		}
	}
	else {
		$.util.log($.util.colors.green(msg));
	}
}


var DEV_DIR = 'src';
var OUTPUT_DIR = '../www';

var config = {
	styles: {
		main: DEV_DIR+'/styles/main.styl',
		watch: [DEV_DIR+'/styles/**/*.styl',DEV_DIR+'/styles/**/*.css'],
		output: OUTPUT_DIR+'/css/'
	},
	images:{
		watch: DEV_DIR+'/images/**/*',
    output: OUTPUT_DIR+'/images/'
  },
	html: {
		watch: DEV_DIR+'/*.html',
		output: OUTPUT_DIR+''
	},
	js: {
		watch: [DEV_DIR+'/js/*.js',DEV_DIR+'/js/*.map'],
		output: OUTPUT_DIR+'/js/'
	},
  csslibs:{
		watch: [
				//'node_modules/materialize-css/dist/css/materialize.min.css',
    ],
    output: OUTPUT_DIR+'/libs/css/'
  },
  fontlibs:{
		watch: [
				//'node_modules/materialize-css/dist/fonts/**/*',
    ],
    output: OUTPUT_DIR+'/libs/fonts/'
  },
  jslibs:{
		watch: [
				//'node_modules/jquery/dist/jquery.min.js',
				//'node_modules/materialize-css/dist/js/materialize.js',
				//'node_modules/backbone/backbone-min.js',
				//'node_modules/underscore/underscore-min.js',
    ],
    output: OUTPUT_DIR+'/libs/'
  },
  templates:{
		watch: DEV_DIR+'/app/templates/**/*.html',
		output: OUTPUT_DIR+'/js/'
	},
	libs:{
		watch: DEV_DIR+'/libs/**/*',
		output: OUTPUT_DIR+'/libs/'
	},
  appjs: {
		watch: [
				DEV_DIR+'/app/**/*.js',
			],
		output: OUTPUT_DIR+'/js/'
	},
};



gulp.task('build:css', function(){
	gulp.src(config.styles.main)
		.pipe(stylus({
			use: nib(),
			'include css': true
		}))
		.pipe(minifyCSS())
		.pipe(gulp.dest(config.styles.output));
});

gulp.task('build:images',function(){
	gulp.src(config.images.watch)
		.pipe(gulp.dest(config.images.output));
});
gulp.task('build:html',function(){
	gulp.src(config.html.watch)
		.pipe(gulp.dest(config.html.output));
});

gulp.task('build:js',function(){
	gulp.src(config.js.watch)
		.pipe(gulp.dest(config.js.output));
});

gulp.task('build:csslibs',function(){
	gulp.src(config.csslibs.watch)
		.pipe(gulp.dest(config.csslibs.output));
});
gulp.task('build:fontlibs',function(){
	gulp.src(config.fontlibs.watch)
		.pipe(gulp.dest(config.fontlibs.output));
});

gulp.task('build:jslibs',function(){
	gulp.src(config.jslibs.watch)
		.pipe(concat('libs.js'))
		.pipe(minify())
		.pipe(gulp.dest(config.jslibs.output));
});

gulp.task('build:appjs',function(){
	gulp.src(config.appjs.watch)
		.pipe(concat('app.js'))
		.pipe(gulp.dest(config.appjs.output));
});

gulp.task('build:libs',function(){
	gulp.src(config.libs.watch)
		.pipe(gulp.dest(config.libs.output));
});

gulp.task('build:templates',function(){
	gulp.src(config.templates.watch)
		.pipe(htmlmin({
        collapseWhitespace: true,
        conservativeCollapse: true
	    }))
		.pipe( template() )
		.pipe(replace('exports[', 'window.templates['))
		.pipe(concat('templates.js'))
		.pipe(gulp.dest(config.templates.output));
});




gulp.task('watch',function(){
	gulp.watch(config.html.watch,['build:html']);
	gulp.watch(config.styles.watch, ['build:css']);
	gulp.watch(config.images.watch, ['build:images']);
	gulp.watch(config.js.watch, ['build:js']);
	gulp.watch(config.jslibs.watch, ['build:jslibs']);
	gulp.watch(config.libs.watch, ['build:libs']);
	gulp.watch(config.csslibs.watch, ['build:csslibs']);
	gulp.watch(config.fontlibs.watch, ['build:fontlibs']);
	gulp.watch(config.appjs.watch, ['build:appjs']);
	gulp.watch(config.templates.watch, ['build:templates']);
});

gulp.task('build',['build:css','build:images','build:libs','build:js','build:html','build:jslibs','build:csslibs','build:fontlibs','build:appjs','build:templates']);



gulp.task('dev-server', function(){
	log('Developer server running...');

	browserSync.init({
		files: [
			"./app/index.html",
      "./app/**/*.*",
		],
		ghostMode: {
			clicks: false,
			forms: true,
			scroll: false
		},
		logFileChanges: true,
		logPrefix: "Visor Map Project",
		notify: true,
		port: 2016,
		reloadDelay: 1500,
		server: {
			baseDir: './app',
			routes: {
				"/": "app"
			}
		}
	});
});



gulp.task('dev',['build', 'dev-server', 'watch']);
