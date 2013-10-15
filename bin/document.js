#!/usr/bin/env node

'use strict';

var document    = require('../');
var express     = require('express');
var clean       = require('clean');
var schema      = require('../lib/schema');
var config      = require('../lib/config');
var server      = require('../lib/server');

var node_path   = require('path');

clean(schema).parseArgv(process.argv, function(err, result, details){
    if ( result.help ) {
        return help();
    }

    var cfg = config.get_config({
        doc_root: result.docs
    });

    var app = express();

    app.use(cfg.site_root, server(cfg, result));

    // initialize static files
    var theme_root = node_path.join(__dirname, '..', 'theme', 'public');
    app.use(cfg.site_root, express.static( theme_root ));
    app.use(cfg.site_root, express.directory( theme_root ));

    app.listen(result.port, function () {
        console.log('started at http://localhost:' + result.port );
        require('child_process').exec('open http://localhost:' + result.port + cfg.site_root);
    });
});


function help () {
    console.log('nothing here by far');
}