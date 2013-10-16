'use strict';

var tools = module.exports = {};
var lang = require('./lang');

tools.nav = function (tree, current_doc) {
    var html = '<ul class="nav nav-list depth-' + tree.depth + '">';
    var pages = tree.pages;

    if ( pages ) {
        lang.each(pages, function (node, name) {
            if ( node === current_doc ) {
                html += '<li class="active">';
            } else {
                html += '<li>';
            }

            console.log('sub node', node);

            var is_folder = node.type === 'folder';

            if ( is_folder ) {
                html += '<a href="' + (node.url || '#') + '" class="aj-nav folder">' + node.name + '</a>';
                html += tools.nav(node, current_doc);

            } else {
                html += '<a href="' + node.url + '">' + node.name + '</a>';
            }

            html += '</li>';
        });
    }

    html += '</ul>';

    return html;
};