#!/usr/bin/env node

'use strict';

var document    = require('../');
var express     = require('express');
var clean       = require('clean');
var schema      = require('../lib/schema');
var config      = require('../lib/config');
var server      = require('../lib/server');

var node_path   = require('path');

clean(schema).parseArgv(process.argv, function(err, args, details){
    if ( args.help ) {
        return help();
    } else {
        delete args.help;
    }

    var port = port;
    delete port;

    var cfg = config.get_config(args);

    var app = express();
    app.use(cfg.site_root, server(cfg));
    app.use(cfg.site_root, express.static( cfg.public_root ));

    app.listen(port, function () {
        console.log('started at http://localhost:' + port );
        require('child_process').exec('open http://localhost:' + port + cfg.site_root);
    });
});


function help () {
    console.log('nothing here by far');
}