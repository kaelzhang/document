'use strict';

var lang = require('./lang');
var node_path = require('path');
var fs = require('fs-sync');
var node_fs = require('fs');


var DEFAULT_CONFIG = {
    site_root: '/'
};

// @param {Object} options
// - doc_root
exports.get_config = function (options) {
    var config_file = node_path.join(options.doc_root, 'config.json');

    if ( !node_fs.existsSync(config_file) ) {
        return DEFAULT_CONFIG;
    }

    var config = require(config_file);
    lang.mix(config, DEFAULT_CONFIG, false);

    return config;
};