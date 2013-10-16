'use strict';

var tools = module.exports = {};
var lang = require('./lang');

// render a navigation struture 
tools.nav = function (tree, current_doc) {
    var html = '<ul class="nav nav-list depth-' + tree.depth + '">';
    var pages = tree.pages;

    if ( pages ) {
        pages.forEach(function (node, name) {
            if ( node === current_doc ) {
                html += '<li class="active">';
            } else {
                html += '<li>';
            }

            var is_folder = node.type === 'folder';

            if ( is_folder ) {
                html += '<a href="' + (node.url || '#') + '" class="aj-nav folder">' + node.display_name + '</a>';
                html += tools.nav(node, current_doc);

            } else {
                html += '<a href="' + node.url + '">' + node.display_name + '</a>';
            }

            html += '</li>';
        });
    }

    html += '</ul>';

    return html;
};