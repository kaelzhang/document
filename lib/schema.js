'use strict';

// options and argv schema

var node_path = require('path');

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
                return node_path.join(cwd, 'doc');
            }

            if ( value === node_path.resolve(value) ) {
                return value;
            }

            return node_path.resolve(cwd, value);
        }
    },

    port: {
        type: Number,
        // d0mT
        default: 9037
    }
};