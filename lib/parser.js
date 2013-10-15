'use strict';

var parser = module.exports = {};

var glob        = require('glob');
var node_path   = require('path');
var sep         = node_path.sep;
var node_fs     = require('fs');
var lang        = require('./lang');
var queue       = require('async');


// parse the tree structure of the document
// basic infomations
// @param {path} dir absolute dir of the document root

// tree:
// {
//     index: 'README.md',
//     depth: 0,
//     pages: {
//         '1_a.md': {
//             parent: <recursive>
//             depth: 1,
//             // empty array indicates there're no sub pages
//             pages: {}
//         }
//     }
// }
parser.raw_tree = function (dir, callback) {
    glob('**/*.md', {
        cwd: dir,
        strict: true

    }, function (err, files) {
        if ( err ) {
            return callback(err);
        }

        var tree = {
            depth: 0,
            type: 'dir',
            pages: {}
        };

        files.forEach(function (file) {
            parser._save_item(tree, file, dir);
        });

        callback(null, tree);
    });
};


parser._save_item = function (tree, path, root) {
    var parent = tree;
    var abs = root;

    path.split(sep).some(function (slice, i) {
        abs = node_path.join(abs, slice);

        if ( slice === 'README.md' ) {
            parent.path = abs;
            return true;
        }

        if ( !(slice in parent.pages) ) {
            var current = parent.pages[slice] = {
                // duplicate data for more easily parsing
                name: slice,
                // parent: parent,
                depth: i + 1,
                path: abs
            };

            if ( node_fs.statSync(abs).isDirectory() ) {
                current.pages = {};
                current.type = 'dir';
                parent = current;

            } else {
                current.type = 'file';
                // if file occurs, skip parsing
                return true;
            }
        }
    });
};


// @param {Object=} languages
// {
//     "zh-CN": {
//     }
// }
parser.language_tree = function (raw_tree, languages) {
    if ( lang.isEmptyObject(languages) ) {
        languages = null;
    }

    var ret = {};

    if ( languages ) {
        var root = raw_tree.pages || {};
        
        lang.each(languages, function (name, language) {
            ret[language] = {
                name: name,
                tree: root[language] || {}
            };
        });

    } else {
        return {
            default: {
                tree: raw_tree
            }
        };
    }
};


// options.
parser.markdown = function (code, callback) {
    marked(code, callback);
};


// @param {Object} options
// - define 
parser.sort_tree = function (tree, options, callback) {
    
};


// create a cache
parser.create_data = function (language_tree, callback) {
    var counter = Object.keys(language_tree).length;
    var error;

    function iterator (node, done) {
        if ( node.type === 'file' ) {
            var file = node.path;

            node_fs.readFile(file, function (err, content) {
                if ( err ) {
                    return done(err);
                }

                parser.markdown(content, function (err, html) {
                    if ( err ) {
                        return done(err);
                    }

                    node.html = html;
                    done(null);
                });
            });

        } else {
            done(null);
        }
    };

    lang.each(language_tree, function (tree, language) {
        parser.walk(tree, function (err) {
            if ( err ) {
                error = err;
                return callback(err);

            } else if (error) {
                return;

            } else if ( -- counter === 0 ) {
                return callback(null, language_tree);
            }
        });
    });
};


// walk a tree
parser.walk = function (tree, iterator, callback) {
    var q = async.queue(iterator);
    var errors = [];

    q.drain = function () {
        callback( errors.length ? errors : null );
    };

    function walk (node) {
        q.push(node, function (err){
            errors.push(err);
        });

        if ( node.pages ) {
            lang.each(node.pages, function (sub_node, name) {
                walk(sub_node);
            });
        }
    }
};

