module.exports = function (grunt) {
	
	grunt.initConfig({
		watch: {
			jade: {
				files: ['views/**'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
				// tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
		},
		nodemon: {
			dev: {
				options: {
					files:'app.js',
					nodeArgs: ['--debug'],
					ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
					watchedExtensions: ['js'],
					watchedFolders: ['./'],
					delayTime: 1,
					env: {
						PORT: 3000
					},
					cwd: __dirname 
				}
			}
		},

		concurrent: {
			tasks: ['nodemon', 'watch','node-inspector'],
			options: {
				logConcurrentOutput: true
			}
		},
		'node-inspector': {
      debug: {}
    }
	});
	
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-nodemon');
	grunt.loadNpmTasks('grunt-node-inspector');
	grunt.loadNpmTasks('grunt-concurrent');
	

	grunt.option('force', true);
	grunt.registerTask('default', ['concurrent']);
}
