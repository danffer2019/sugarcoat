var path = require( 'path' );
var _ = require( 'lodash' );
var postcss = require( 'postcss' );
var prefixer = require( 'postcss-prefix-selector' );
var Handlebars = require( 'handlebars' );

var hbsHelpers = require( '../../lib/handlebars-helpers' );
var log = require( '../../lib/logger' );
var globber = require( '../../lib/globber' );
var fsp = require( '../../lib/fs-promiser' );


module.exports = function ( config ) {

    Handlebars.registerHelper( hbsHelpers );

    return globPartials( config )
    .then( readPartials )
    .then( registerPartials )
    .then( config => {

        if ( config.settings.prefix.assets ) {

            return globPrefixAssets( config )
            .then( prefixAssets );
        }
        else return config;
    })
    .then( copyAssets )
    .catch( function ( err ) {
        return err;
    });
};

/*
    Tasks
*/

function copyAssets( config ) {

    var flattened = [];

    var expand = config.settings.template.assets.map( function ( asset ) {

        return globber({
            src: asset.src,
            options: asset.options
        })
        .then( function ( files ) {

            asset.srcFiles = files;

            return asset.srcFiles.map( assetPath => {

                var result = {
                    from: path.resolve( asset.options.cwd, assetPath ),
                    to: path.resolve( config.settings.dest, path.relative( asset.options.cwd, assetPath ) )
                };

                flattened.push( result );

                return result;
            });
        });
    });

    return Promise.all( expand )
    .then( () => {

        return Promise.all( flattened.map( asset => {

            return fsp.copy( asset.from, asset.to )
            .then( assetPaths => {

                return log.info( 'Templater', `asset copied: ${ path.relative( config.settings.dest, assetPaths[ 1 ] )}`);
            });
        }));
    })
    .then( () => {

        return config;
    })
    .catch( function ( err ) {
        log.error( 'Copy Assets', err );

        return err;
    });
}

function globPartials( config ) {

    return globFiles( config.settings.template.partials )
    .then( function ( partials ) {
        config.settings.template.partials = _.flatten( partials );

        return config;
    }).catch( function ( err ) {

        log.error( 'Glob Partials', err );
    });
}

function readPartials( config ) {

    var partials = config.settings.template.partials.map( function ( fileObj ) {

        return fsp.readFile( fileObj.file )
        .then( function ( data ) {

            return fileObj.src = data;
        });
    });

    return Promise.all( partials )
    .then( function () {
        return config;
    });
}

function registerPartials( config ) {

    config.settings.template.partials.forEach( function ( partial ) {

        var isOverride = !!Handlebars.partials[ partial.name ]
            , msgNormal = `partial registered: "${partial.name}"`
            , msgOverride = `partial registered: "${partial.name}" partial has been overridden`
            , msg = isOverride ? msgOverride : msgNormal
            ;

        if ( isOverride ) Handlebars.unregisterPartial( partial.name );

        Handlebars.registerPartial( partial.name, partial.src );

        log.info( 'Templater', msg );
    });

    return config;
}

function globPrefixAssets( config ) {

    return globFiles( config.settings.prefix.assets )
    .then( assets => {
        config.settings.prefix.assets = _.flatten( assets );

        return config;
    })
    .catch( err => {

        log.error( 'Glob Prefix Assets', err );
    });
}

function prefixAssets( config ) {

    return Promise.all( config.settings.prefix.assets.map( file => {

        file.prefixed = `sugarcoat/css/prefixed-${file.name}.css`;

        return  fsp.readFile( file.file )
        .then( data => {

            return postcss()
            .use( prefixer({
                prefix: config.settings.prefix.selector
            }))
            .process( data )
            .then( result => {

                return fsp.writeFile( path.join( config.settings.dest, file.prefixed ), result.css );
            })
            .then( result => {
                log.info( 'Templater', `asset prefixed: ${path.relative( config.settings.cwd, path.join( config.settings.dest, file.prefixed ) )}`);

                return result;
            });
        });
    }))
    .then( () => {

        return config;
    })
    .catch( ( err ) => {
        log.error( 'Prefix Assets', err );

        return err;
    });
}

/*
    Utils
 */
function globFiles( files ) {

    var globArray = files.map( file => {

        return globber({
            src: file.src,
            options: file.options
        })
        .then( function ( files ) {

            return files.reduce( function ( collection, filePath ) {

                collection.push({
                    cwd: file.src,
                    file: filePath,
                    name: path.basename( filePath, path.parse( filePath ).ext )
                });

                return collection;
            }, []);
        });
    });

    return Promise.all( globArray );
}