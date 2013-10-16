'use strict';

module.exports = server;

var node_path   = require('path');
var node_fs     = require('fs');
var node_url    = require('url');
var lang        = require('./lang');
var tools       = require('./tools');
var dao         = require('./dao');
var ejs         = require('ejs');

function server (options) {
    var user = options.user;
    var sys = options.sys;

    return function (req, res, next) {
        var req_data = server.apply_language(user, req.url);

        dao.current(req_data, options, function (err, data) {
            var current = data.current;
            var tree = data.tree;

            console.log(tree)

            if ( !current ) {
                return next();
            }

            var content = server.render(sys.theme, {
                config  : user,
                tree    : tree,
                current : current,
                tools   : tools
            });

            res.send(content);
        });
    };
}


server.render = function (theme, data) {
    var template_file = node_path.join(theme, 'include', 'template', 'doc.ejs');
    var template_text = node_fs.readFileSync(template_file).toString();

    var template_fn = ejs.compile(template_text, {
        filename: template_file,
        cache: true
    });

    return template_fn(data);
};


server.apply_language = function (cfg, url) {
    url = node_url.parse(url, true);

    var slices = url.pathname.split('/').filter(Boolean);
    var language = slices[0];
    var languages = cfg.languages || {};

    var default_language = cfg.default_language;

    // req -> /docs/zh-CN/xxx/xxx
    if ( language in languages ) {
        slices.shift();

    // req -> /docs/xxx/xxx
    // -> /docs/<default-language>/xxx/xxx
    } else {
        language = default_language;
    }

    return {
        languages   : languages,
        language    : language,
        path_slices : slices,
        query       : url.query
    }
};