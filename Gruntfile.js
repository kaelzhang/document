module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.initConfig({
        less: {
          development: {
            files: {
              "theme/public/css/daux-blue.css": "theme/public/less/daux-blue.less",
              "theme/public/css/daux-green.css": "theme/public/less/daux-green.less",
              "theme/public/css/daux-navy.css": "theme/public/less/daux-navy.less",
              "theme/public/css/daux-red.css": "theme/public/less/daux-red.less"
            }
          }
        }
    });

    grunt.registerTask('default', ['less']);
}
