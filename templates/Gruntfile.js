module.exports = function(grunt) {
	//configure grunt plugins
	grunt.initConfig({
		env: {
			dev: {
				src: "./env/dev/.env"
			}
		},

		nodemon: {
			dev: {
				script: "./bin/www",
				options: {
					nodeArgs: ["--inspect"],
					ignore: ["public/javascripts/**/*.js"]
				}
			}
		},

		sass: {
			dist: {
				options: {
					update: true
				},
				files: [
					{
						// Set to true for recursive search
						expand: true,
						cwd: "public/stylesheets/src",
						src: ["**/*.scss"],
						dest: "public/stylesheets/dist",
						ext: ".css"
					}
				]
			}
		},

		postcss: {
			options: {
				processors: [require("autoprefixer")({ browsers: "last 2 versions" })]
			},
			dist: {
				src: "public/stylesheets/dist/**/*.css"
			}
		},

		cssmin: {
			target: {
				options: {
					update: true
				},
				files: [
					{
						expand: true,
						cwd: "public/stylesheets/dist",
						src: ["**/*.css", "!**/*.min.css"],
						dest: "public/stylesheets/dist-min",
						ext: ".min.css"
					}
				]
			}
		},

		babel: {
			options: {
				sourceMap: false
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: "public/javascripts/src/",
						src: "**/*.js",
						dest: "public/javascripts/dist/"
					}
				]
			}
		},

		uglify: {
			scripts: {
				files: [
					{
						expand: true,
						cwd: "public/javascripts/dist/",
						src: "**/*.js",
						dest: "public/javascripts/dist-min/",
						ext: ".min.js",
						extDot: "first"
					}
				]
			}
		},

		// watch sass and js files and process the above tasks
		watch: {
			css: {
				files: ["public/stylesheets/src/**/*.scss", "public/stylesheets/dist/**/*.css"],
				tasks: ["sass", "postcss", "cssmin"]
			}
		},

		// run watch and nodemon at the same time
		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			tasks: ["nodemon", "watch"]
		}
	});

	//load tasks
	grunt.loadNpmTasks("grunt-nodemon");
	grunt.loadNpmTasks("grunt-concurrent");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-postcss");
	grunt.loadNpmTasks("grunt-env");

	//register tasks
	grunt.registerTask("default", ["env:dev", "sass", "postcss", "cssmin", "babel", "uglify", "concurrent"]);
	grunt.registerTask("rundev", ["env:dev", "sass", "postcss", "cssmin", "babel", "uglify", "concurrent"]);
	grunt.registerTask("build", ["env:dev", "sass", "postcss", "cssmin", "babel", "uglify"]);
};
