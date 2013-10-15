'use strict';

module.exports = server;

var node_path   = require('path');
var node_fs     = require('fs');
var node_url    = require('url');
var lang        = require('./lang');
var dao         = require('./dao');
var ejs         = require('ejs');

function server (cfg, args) {
    return function (req, res, next) {
        var req_data = server.apply_language(cfg, req.url);

        dao.docs(args.docs, function (err, docs) {
            var found = server.route(req_data, docs);

            if ( !found ) {
                return next();
            }

            var template = ejs.compile( node_fs.readFileSync( node_path.join(args.theme, 'include', 'template', 'doc.ejs') ).toString() );

            res.send(
                template({
                    config: cfg,
                    docs: found
                })
            );
        });
    };
}


server.route = function (req_data, docs) {
    var language = req_data.language || 'default';
    var slices = req_data.path_slices;

    var tree =  docs[language.toLowerCase()];

    if ( !tree ) {
        return null;
    }

    tree = tree.tree;

    slices.some(function (slice) {
        tree = server.search_into(tree, slice);

        if ( !tree ) {
            return true;
        } 
    });

    return tree;
};


server.search_into = function (node, name) {
    var pages = node.pages;

    if ( !pages ) {
        return null;
    } else {
        var found = null;

        lang.each(pages, function (sub_node, key) {
            if ( found ) {
                return;
            }

            if ( key === name || sub_node.title === name) {
                found = sub_node;
            }
        });

        return found;
    }
};


server.apply_language = function (cfg, url) {
    url = node_url.parse(url, true);

    var slices = url.pathname.split('/').filter(Boolean);
    var lingo = slices[0];
    var languages = cfg.languages || {};
    var has_languages = !lang.isEmptyObject(languages);

    var default_language = has_languages ? cfg.default_language || Object.keys(languages)[0] : null;

    // req -> /docs/zh-CN/xxx/xxx
    if ( has_languages && (lingo in slices) ) {
        slices.shift();

    // req -> /docs/xxx/xxx
    // -> /docs/<default-language>/xxx/xxx
    } else {
        lingo = default_language;
    }

    return {
        languages   : languages,
        language    : lingo,
        path_slices : slices,
        query       : url.query
    }
};