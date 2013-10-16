'use strict';

var dao = module.exports = {};
var parser = require('./parser');
var config = require('./config');

// a simple pool
dao._queue = [];
dao._pending = false;

// get the whole data tree
dao.tree = function (options, callback) {
    if ( dao._data ) {
        return callback(null, dao._data);
    }

    dao._queue.push(callback);

    if ( dao._pending ) {
        return;
    }

    dao._pending = true;

    var sys = options.sys;
    var user = options.user;

    parser.raw_tree( sys.doc, function (err, raw_tree) { 
        if ( err ) {
            return dao._complete(err);
        }

        var ltree = parser.language_tree(raw_tree, user.languages);

        parser.create_data(ltree, function (err, data) {
            if ( err ) {
                return dao._complete(err);
            }

            dao._data = data;
            dao._complete(null, data);
        });
    });
};


// get the current document
dao.current = function (req_data, options, callback) {
    dao.tree(options, function (err, tree) {
        if ( err ) {
            return callback(err);
        }

        var lang = require('./lang');

        var ltree = dao._language_tree(tree, req_data.language);
        var found = null;

        if ( ltree ) {
            found = dao._route(ltree, req_data.path_slices);
        }

        callback(null, {
            current : found,
            tree    : ltree || 
                // use the default tree
                dao._language_tree(tree, options.user.default_language)
        });
    });
};


dao._language_tree = function (tree, language) {
    language = language || 'default';

    tree = tree[language.toLowerCase()];

    if ( !tree ) {
        return null;
    }

    return tree.tree;
};


dao._route = function (tree, slices) {
    var slash = '/';
    var pathname = slash + slices.join(slash) + slash;

    return dao._search_into(tree, pathname);
};


dao._search_into = function (node, pathname) {
    var pages = node.pages;
    var match;

    if ( pages ) {
        pages.some(function (sub_node) {
            var sub_uri = sub_node.url + '/';

            if ( pathname.indexOf(sub_uri) === 0 ) {
                match = sub_node;
                return true;
            }
        });
    }
    
    return match && dao._search_into(match, pathname) || match;
};


dao._complete = function (err, data) {
    dao._pending = false;

    dao._queue.forEach(function (callback) {
        callback(err, data);
    });

    dao._queue.length = 0;
};

