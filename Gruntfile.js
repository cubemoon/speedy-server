'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		apidoc: {
			myapp: {
				src: "api/",
				dest: "doc/"
			}
		}
	});

	grunt.loadNpmTasks('grunt-apidoc');
	grunt.registerTask('doc', ['apidoc']);
};