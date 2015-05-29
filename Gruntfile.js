module.exports = function (grunt) {

  //Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['./*.js'],
      options: {
        globals: {
          jQuery: true,
          module: true,
          require: true,
          console: true,
          __dirname: true,
          $: true,
          io: true,
          setTimeout: true
        }
      }
    },
    nodeunit: {
      all: ['test/*_test.js'],
      options: {
        reporter: 'junit',
        reporterOptions: {
          output: 'test/output'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
};
