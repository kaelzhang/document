'use strict';

// generate the global configurations
// only used by bin

var config = module.exports = {};

var fs          = require('fs-sync');
var clean       = require('clean');

var lang        = require('./lang');

var node_path   = require('path');
var node_fs     = require('fs');

// document.json > package.json > default

// function trim (string, trimmer) {
//     var regex = new RegExp('^(?:' + trimmer + ')+|(?:' + trimmer + ')$', 'g');

//     return string.replace(regex, '');
// }

var REGEX_TRIM_SLASH = /^\/+|\/+$/g;

// standardize important config keys
var DEFAULT_SCHEMA = {
    site_root: {
        type: String,
        default: '/',
        setter: function (root) {
            root = root.replace(REGEX_TRIM_SLASH, '');

            if ( root ) {
                // '/'      -> ''
                // '/doc', '/doc/', 'doc/' -> '/doc'
                root = '/' + root;
            }

            return root;
        }
    },

    repositories: {
        setter: function (repos) {
            repos = repos || this.get('repository');

            return lang.makeArray(repos);
        }
    },

    languages: {
        setter: function (languages) {
            return languages || {};
        }
    },

    default_language: {
        setter: function (default_language) {
            return default_language || Object.keys(this.get('languages'))[0] || null;
        }
    },

    index: {
        default: 'README.md'
    }
};


// {
//     "title": "DAUX.IO",
//     "tagline": "The Easiest Way To Document Your Project",
//     X "docs_path": "../cortex/doc",
//     "image": "img/app.png",
//     X "theme": "navy",
//     "date_modified": true,
//     "repository": {
//         "url": "https://github.com/kaelzhang/node-document.git"
//     },
//     "twitter": ["justin_walsh", "todaymade"],
//     "google_analytics": "UA-12653604-10",
//     "links": {
//         "Download": "https://github.com/justinwalsh/daux.io/archive/master.zip",
//         "GitHub Repo": "https://github.com/justinwalsh/daux.io",
//         "Help/Support/Bugs": "https://github.com/justinwalsh/daux.io/issues",
//         "Made by Todaymade": "http://todaymade.com"
//     },
//     "languages": {
//         "zh-CN": "中文",
//         "en-US": "English"
//     },
//     "site_root": "/docs",
//     "index": "README.md",
//     "default_language": "en-US"
// }

// @param {Object} args arguments from cli
// - cwd: {path} repo root, requred
// - doc: {path=} document root, optional
// - theme: {path=} theme root, optional
config.get_config = function (cli_args, callback) {
    var cwd = cli_args.cwd;

    config.read_package_json(cwd, function (err, pkg) {
        if ( err ) {
            return callback(err);
        }

        var doc = cli_args.doc || 
            // make sure it's an absolute url
            node_path.join(
                cwd, 
                // commonjs: [package/1.0](http://wiki.commonjs.org/wiki/Packages/1.0)
                pkg.directories && pkg.directories.doc ||
                    // default to doc
                    'doc'
            );


        config.read_config_json(doc, function (err, cfg) {
            if ( err ) {
                return callback(err);
            }

            cfg.title = cfg.title || pkg.name;
            cfg.tagline = cfg.tagline || pkg.description || '';

            clean({
                schema: DEFAULT_SCHEMA

            }).clean(cfg, function (err, result) {
                if ( err ) {
                    return callback(err);
                } 

                var theme = cli_args.theme || node_path.join(__dirname, '..', 'theme');

                callback(null, {
                    user: result,
                    sys: {
                        cwd: cwd,
                        doc: doc,

                        // hard coded
                        theme: theme,
                        public_root: node_path.join(theme, 'public')
                    }
                });
            });
        });
    });
};


config.read_config_json = function (doc, callback) {
    var file = node_path.join(doc, 'config.json');

    config._read_json(file, callback);
};


config.read_package_json = function (cwd, callback) {
    var file = node_path.join(cwd, 'package.json');

    config._read_json(file, callback);
};


config._read_json = function (file, callback) {
    // for those who are not commonjs projects
    if ( !fs.exists(file) ) {
        return callback(null, {});

    } else {
        try {
            callback(null, require(file));
        } catch(e) {
            callback({
                code: 'EPARSEJSON',
                message: 'Error parsing "' + file + '"',
                data: {
                    file: file
                }
            });
        }
    }
};


