var fs = require('fs');
var path = require('path');
var notifier = require('node-notifier');
var colors = require('colors');

function log(err, stdout, stderr, cb) {
    console.log(stdout);
    console.log(stderr);
    console.log(err);
    cb();
}

module.exports = function(grunt) {

  grunt.registerTask('notify', 'Build notify', function() {
    notifier.notify({
      title: 'Grunt',
      message: 'Grunt tasks completed successfully.',
      sound: true, // Only Notification Center or Windows Toasters
      wait: false // wait with callback until user action is taken on notification
    }, function (err, response) {
      // response is response from notification
    });
    return true;
  });

  grunt.registerTask('changed', 'Changed Notify', function() {
    notifier.notify({
      title: 'Grunt',
      message: 'Grunt tasks starting',
      sound: true, // Only Notification Center or Windows Toasters
      wait: false // wait with callback until user action is taken on notification
    }, function (err, response) {
      // response is response from notification
    });
    return true;
  });

  grunt.registerTask('watching', 'Watching Notify', function() {
    console.log(colors.cyan('Ready / Watching'));
    return true;
  });

  function logShell(log)
  {
    console.log(colors.white(log));
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: {
      build: {
        NODE_ENV: 'production'
      }
    },

    shell: {
      copy: {
        options: { /*callback: logShell, */ stdout: true, stderr: true },
        command: "cp -R infinium/. Electron.app/Contents/Resources/default_app/."
      },
      run: {
        command: "open Electron.app"
      },
      kill: {
        command: "killall Electron",
        options: { failOnError: false }
      }
    },

    watch: {
       copy: {
        files: ['infinium/*', './infinium/**/*'],
        tasks: ['changed', 'shell:copy', 'notify', 'shell:kill', 'shell:run']
      },
      options: {
        nospawn: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['shell:copy', 'notify', 'shell:run']);
//  grunt.registerTask('watch', ['watching', 'watch:copy']);
  //grunt.registerTask('build', ['env:build', 'browserify:build', 'copy']);
};
