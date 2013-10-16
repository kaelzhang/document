[![NPM version](https://badge.fury.io/js/document.png)](http://badge.fury.io/js/document)
[![Build Status](https://travis-ci.org/kaelzhang/node-document.png?branch=master)](https://travis-ci.org/kaelzhang/node-document)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-document.png)](https://gemnasium.com/kaelzhang/node-document)

# document

Create your document site with only **ONE** command.

# Life gets easier

To create your document site, just:

```sh
npm install document -g
cd /path/to/your/repo
document
```

Oh YEAH! That's it! We made it!

# Feature

- Could not be easier ! Just ONE command!
- Build with [node.js](http://nodejs.org), yeah !
- Support CommonJS [package/1.0](http://wiki.commonjs.org/wiki/Packages/1.0) spec.
- Designed to minimize arguments and configurations as much as possible.
- Support documents of multiple languages.
- Supports [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown).
- Lovely and SEO friendly URLs.
- Application cache so that to afford heavy traffic.
- Custom themes and dev guide with `grunt-init` task. (what's comming...) 
- `document` middleware for [express.js](http://expressjs.com). (what's comming...)


# Usage

Visit [the document site](http://kael.me/document) for details.

## Specify the `doc` Directory

By default, if your repo is based on commonjs, `document` will use the [`directories.doc`](http://wiki.commonjs.org/wiki/Packages/1.0#Package_Directory_Layout) field of the package.json as the document root.

If there's no package.json or no `directories.doc` field, `document` will use `'doc'` folder by default.

But you can specify it by using `--doc` argument, for example:

```sh
document --doc /somewhere/else
```

## Basic Informations

It's best to use `document` command at the root of your repo, in order to read the package.json.

`document` will try to read the 'config.json' file inside the `doc` folder, which has higher priority upon 'package.json'.

- title: the document title of the web page
- tagline: the description


# Credits

`document@0.x.x` uses the theme of [daux.io](daux.io), thanks a million.


# What's comming!

## Vision `1.x.x`

> Actually, all those features below has been designed and implemented at the very beginning of `document`, but they were not fully tested yet.
>
> I will release them immediately when the test cases are ok.

- You will be able to `require('document')` as an express middleware. (actually it already is)
- Custom themes support.
- Plugins.
- Programmatical APIs.






