'use strict';

var parser = module.exports = {};

var glob        = require('glob');
var marked      = require('marked');
var highlight   = require('highlight.js');
var node_path   = require('path');
var sep         = node_path.sep;
var node_fs     = require('fs');
var lang        = require('./lang');
var async       = require('async');


// parse the tree structure of the document
// basic infomations
// @param {path} dir absolute dir of the document root

// tree:
// {
//     index: 'README.md',
//     // relative depth
//     rel_depth: 0,
//     pages: {
//         '1_a.md': {
//             parent: <recursive>
//             rel_depth: 1,
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
            rel_depth: 0,
            pages: {},
            type: 'dir'
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

        var current = parent.pages[slice];

        if ( !current ) {
            current = parent.pages[slice] = {
                // duplicate data for more easily parsing
                name: slice,
                // parent: parent,
                rel_depth: i + 1,
                path: abs
            };

            if ( node_fs.statSync(abs).isDirectory() ) {
                if ( !current.pages ) {
                    current.pages = {};
                }

                current.type = 'dir';
                parent = current;

            } else {
                current.type = 'file';
                // if file occurs, skip parsing
                return true;
            }
        }

        parent = current;
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
            ret[language.toLowerCase()] = {
                name: name,
                tree: root[language] || {}
            };
        });

        return ret;

    } else {
        return {
            default: {
                tree: raw_tree
            }
        };
    }
};


var SUPPORTED_LANG = Object.keys(highlight.LANGUAGES);

var marked_opt = {
    breaks: false,
    gfm: true,
    langPrefix: 'language-',
    pedantic: false,
    sanitize: false,
    silent: false,
    smartLists: false,
    smartypants: false,
    tables: true,
    highlight: function (code, lang) {
        if ( ~ SUPPORTED_LANG.indexOf(lang) ) {
            return highlight.highlight(lang, code).value;
        } else {
            return highlight.highlightAuto(code).value;
        }
    }
};

// options.
parser.markdown = function (code, callback) {
    marked(code, marked_opt, callback);
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

                parser.markdown(content.toString(), function (err, html) {
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

    lang.each(language_tree, function (l, language) {
        parser.walk(l.tree, iterator, function (err) {
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
            if ( err ) {
                errors.push(err);
            }
        });

        if ( node.pages ) {
            lang.each(node.pages, function (sub_node, name) {
                walk(sub_node);
            });
        }
    }

    walk(tree);
};

