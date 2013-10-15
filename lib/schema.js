'use strict';

// options and argv schema

var node_path = require('path');
var fs = require('fs-sync');

exports.shorthands = {
    c: 'cwd',
    h: 'help',
    p: 'port'
};

exports.schema = {
    help: {
        type: Boolean
    },

    cwd: {
        type: node_path,
        default: process.cwd()
    },

    docs: {
        setter: function (value, is_default) {
            var cwd = this.get('cwd');

            if ( is_default ) {
                value = node_path.join(cwd, 'doc');

            } else if ( value !== node_path.resolve(value) ) {
                value = node_path.resolve(cwd, value);
            }

            return value;
        }
    },

    port: {
        type: Number,
        // d0mT
        default: 9037
    },

    // not available yet
    theme: {
        default: node_path.join(__dirname, '..', 'theme'),
        setter: function (value, is_default) {
            // fake, hard code
            return node_path.join(__dirname, '..', 'theme');
        }
    }
};