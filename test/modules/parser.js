'use strict';

var parser = require('../../lib/parser');
var config = require('../../lib/config');

var expect = require('chai').expect;

var node_path = require('path');

describe("description", function(){
    it("description", function(done){
        var doc_root = node_path.resolve('test/repo/doc');

        parser.raw_tree( doc_root, function (err, tree) {
            done();
            console.log('raw tree:', tree);

            var cfg = config.get_config({
                doc_root: doc_root
            });

            console.log('cfg', cfg)

            var ltree = parser.language_tree(tree, cfg.languages);

            console.log('language tree', ltree)
        });
    });
});