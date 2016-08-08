/*eslint-env node*/
'use strict';

var LIVERELOAD_PORT = 35729;
var CONNECT_PORT = 9000;


var build = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt);

    grunt.initConfig({
        // Project settings
        pkg: grunt.file.readJSON('package.json'),
        config: {
            // Configurable paths
            app: 'app',
            dist: 'dist'
        },
        connect: {
            options: {
                port: gruntOptions.connectPort,
                useAvailablePort: true,
                livereload: gruntOptions.liveReloadPort
            },
            test: {
                options: {
                    livereload: false,
                    base: [
                        '.tmp',
                        'test',
                        '<%= config.app %>',
                        '.'
                    ]
                }
            },
            'test-browser': {
                options: {
                    base: '<%= connect.test.options.base %>',
                    open: true
                }
            }
        },

        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    src: '**/*.js',
                    dest: '<%= config.dist %>/app'
                }]
            }
        },
        clean: {
            styles: ['.tmp/styles'],
            dist: [
                '.tmp',
                '<%= config.dist %>'
            ],
            server: [
                '.tmp',
                '<%= config.dist %>'
            ]
        },
        copy: {
            requirejs: {
                options: {
                    process: function (content) {
                        return content
                            .replace(/\.\.\/vendor/g, '../../lib/vendor')
                            .replace(new RegExp('\\\.\\\.\/' + frontendModulesRoot, 'g'), '../../' + frontendModulesRoot);
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    dest: '.tmp',
                    src: 'scripts/config.js'
                }]
            },
            hbs: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    dest: '.tmp',
                    src: 'scripts/**/*.hbs'
                }]
            }
        },
        concat: {
            test: {
                options: {
                    process: function (src) {
                        src = src.replace(/\/\*% TEST_PREREQ %\*\//, gruntOptions.testPreRequisitesList);
                        src = src.replace(/\/\*% TEST_LIST %\*\//, gruntOptions.testPlansList);
                        return src;
                    },
                    banner: '/* GENERATED BY GRUNTFILE DO NOT EDIT (source: <%= concat.test.src %>) */\n'
                },
                src: 'test/test-runner-template.js',
                dest: '.tmp/test-runner.js'
            }
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: 'dist/app',
                    optimize: 'none',
                    mainConfigFile: '.tmp/scripts/config.js',
                    paths: {
                        'core-ui': 'main',
                        'styles': '../../.tmp/styles'
                    },
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    findNestedDependencies: true,
                    useStrict: true,
                    name: '<%= pkg.name %>',
                    exclude: [
                        'backbone',
                        'backbone.babysitter',
                        'backbone.marionette',
                        'backbone.paginator',
                        'backbone.wreqr',
                        'blueimp-file-upload/js/jquery.fileupload',
                        'blueimp-file-upload/js/jquery.iframe-transport',
                        'cacheburst',
                        'filesize',
                        'hbs',
                        'jquery',
                        'jquery-highlight',
                        'jquery-ui/ui/core',
                        'jquery-ui/ui/progressbar',
                        'jquery-ui/ui/widget',
                        'mixpanel-browser',
                        'moment',
                        'placeholder',
                        'require-css/css',
                        'require-css/css-builder',
                        'require-css/normalize',
                        'select2',
                        'timeago',
                        'underscore',
                        'uuidjs'
                    ],
                    out: './<%= config.dist %>/<%= pkg.name %>.js'
                }
            }
        },
        eslint: {
            lib: [
                'Grunt*.js',
                '<%= config.app %>/scripts/**/*.js',
                '!<%= config.app %>/vendor/*'
            ],
            test: {
                src: [
                    'test/{,**/}*.js'
                ]
            }
        },
        mocha: {
            all: {
                options: {
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html'],
                    run: false,
                    reporter: gruntOptions.mochaReporter,
                    log: gruntOptions.testLog,
                    logErrors: gruntOptions.testLog
                }
            }
        },
        watch: {
            babel: {
                files: [
                    '<%= config.app %>/scripts/**/*.js'
                ],
                tasks: ['babel:dist']
            },
            babelTest: {
                files: [
                    'test/spec/**/*.js'
                ],
                tasks: ['babel:test']
            },
            js: {
                files: [
                    '<%= config.app %>/scripts/**/*.js',
                    'test/**/*.js',
                    '!**/node_modules/**'
                ],
                tasks: gruntOptions.watchTarget
            },
            styles: {
                files: ['<%= config.app %>/styles/**/*.scss'],
                tasks: 'sass-compile'
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.app %>/*.html',
                    '{.tmp,<%= config.app %>}/{scripts,styles}/**/*.{js,hbs,scss}',
                    '.tmp/test-runner.js',
                    'test/**/*.js'
                ]
            }
        },
        githooks: {
            all: {
                'pre-commit': 'validate'
            }
        },

        sass: {
            dist: {
                options: {
                    includePaths: [
                        frontendModulesRoot
                    ],
                    outputStyle: 'expanded',
                    sourceMap: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    src: ['{scripts,styles}/**/*.scss'],
                    dest: '.tmp',
                    ext: '.css'
                }]
            }
        },

        postcss: {
            options: {
                processors: [
                    require('postcss-assets')({
                        loadPaths: [
                            frontendModulesRoot
                        ]
                    }),
                    require('autoprefixer')({browsers: ['last 2 versions', 'ie 9']}),
                    require('stylelint')
                ]
            },
            dist: {
                src: '.tmp/**/*.css'
            }
        }
    });

    grunt.registerTask('serve', 'Launches the http development server', function (target) {
        if (target === 'test') {
            return grunt.task.run([
                'clean:server',
                'babel',
                'sass-compile',
                'concat:test',
                'connect:test-browser',
                'watch'
            ]);
        }
    });

    grunt.registerTask('test', [
        'clean:server',
        'babel',
        'sass-compile',
        'test-console'
    ]);

    grunt.registerTask('lint-styles', [
        'clean:styles',
        'babel:dist',
        'sass-compile'
    ]);

    grunt.registerTask('test-console', [
        'concat:test',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('test-browser', [
        'concat:test',
        'serve:test'
    ]);

    grunt.registerTask('test-all', [
        'test',
        'test-browser'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'babel:dist',
        'copy:requirejs',
        'copy:hbs',
        'sass-compile',
        'requirejs'
    ]);

    grunt.registerTask('validate', [
        'eslint',
        'test'
    ]);

    grunt.registerTask('default', [
        'validate',
        'build'
    ]);

    grunt.registerTask('sass-compile', ['sass', 'postcss']);

};
module.exports = build;