'use strict';

var parser = module.exports = {};

var glob = require('glob');
var node_path = require('path');
var node_fs = require('fs');
var sep = node_path.sep;


// parse the tree structure of the document
// basic infomations
// @param {path} dir absolute dir of the document root

// tree:
// {
//     index: 'index.md',
//     depth: 0,
//     pages: {
//         '1_a.md': {
//             parent: <recursive>
//             depth: 1,
//             // empty array indicates there're no sub pages
//             pages: []
//         }
//     }
// }

parser.tree = function (dir, callback) {
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

        if ( slice === 'index.md' ) {
            parent.path = abs;
            return true;
        }

        if ( !('slice' in parent.pages) ) {
            var current = parent.pages[slice] = {
                parent: parent,
                depth: i + 1,
                path: abs
            };

            if ( node_fs.statSync(abs).isDirectory() ) {
                current.pages = {};
                current.type = 'dir';

            } else {
                current.type = 'file';
                // if file occurs, skip parsing
                return true;
            }
        }

        parent = current;
    });
};


// options.
parser.markdown = function (code, callback) {
    marked(code, callback);
};

