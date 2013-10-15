'use strict';

var dao = module.exports = {};
var parser = require('./parser');
var config = require('./config');


dao.docs = function (doc_root, callback) {
    parser.raw_tree( doc_root, function (err, tree) { 
        if ( err ) {
            return callback(err);
        }

        var cfg = config.get_config({
            doc_root: doc_root
        });

        var ltree = parser.language_tree(tree, cfg.languages);

        parser.create_data(ltree, function (err, data) {
            if ( err ) {
                return callback(err);
            }

            callback(null, data);
        });
    });
};