'use strict';

var parser = require('../../lib/parser');
var expect = require('chai').expect;

var node_path = require('path');

describe("description", function(){
    it("description", function(done){
        parser.raw_tree( node_path.resolve('test/repo/doc'), function (err, tree) {
            done();
            console.log(tree);
        })
    });
});