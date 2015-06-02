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
        reporter: 'minimal',
        reporterOptions: {
          output: 'test/output/<%= grunt.template.today("hh-mm") %>.out'
        }
      }
    },
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: ['./*.js'],
        // the location of the resulting JS file
        dest: './<%= pkg.name %>.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('test', ['jshint', 'nodeunit']);

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
