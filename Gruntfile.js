module.exports = function ( grunt ) {

    /* Configure */
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        buildRoot: '/'
    });

    grunt.config( 'autoprefixer', {
        options: {
            browsers: [ 'last 2 versions', 'ie 10' ]
        },
        files: {
            expand: true,
            src: 'generators/pattern-library/templates/sugarcoat/css/**/*.css'
        }
    });

    grunt.config( 'sass', {
        dist: {
            options: {
                sourcemap: 'inline',
                style: 'expanded',
                lineNumbers: true,
                precision: 5
            },
            files: [
                {
                    expand: true,
                    cwd: 'generators/pattern-library/templates/styles',
                    src: [
                        '*.scss'
                    ],
                    dest: 'generators/pattern-library/templates/sugarcoat/css',
                    ext: '.css'
                }
            ],
            rename: function ( dest, src ) {

                var path = require( 'path' )
                    , splitDirs = src.split( '/' )
                    ;

                splitDirs[ splitDirs.indexOf( 'scss' ) ] = 'css';

                return path.join( dest, splitDirs.join( '/' ) );
            }
        }
    });

    grunt.config( 'eslint', {
        src: [
            'lib/*.js',
            'generators/*.js',
            'generators/pattern-library/**/*.js',
            'grunt/*.js',
            'Gruntfile.js',
            '!generators/pattern-library/examples/**/*.js',
            'test/*.js'
        ]
    });

    grunt.config( 'stylelint', {
        lint: {
            options: {
                debug: true,
                reporters: [
                    {
                        formatter: 'string',
                        console: true
                    }
                ]
            },
            files: [
                {
                    expand: true,
                    cwd: 'generators/pattern-library/templates',
                    src: [
                        'styles/**/*.scss'
                    ],
                    dest: 'generators/pattern-library/templates',
                    ext: 'styles/**/*.css'
                }
            ]
        }
    });


    grunt.loadNpmTasks( 'grunt-autoprefixer' );
    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-eslint' );
    grunt.loadNpmTasks( 'grunt-stylelint' );
    /* Task aliases */
    grunt.registerTask( 'sassdev', 'Compile Sass files', [
        'stylelint',
        'sass',
        'autoprefixer'
    ]);

    grunt.registerTask( 'lint', 'Lint all files', [
        'eslint',
        'stylelint'
    ]);
};