# Sugarcoat #

[![NPM version](https://badge.fury.io/js/sugarcoat.svg)](https://www.npmjs.com/package/sugarcoat) [![Dependency Status](https://david-dm.org/sapientnitrola/sugarcoat.svg)](https://david-dm.org/sapientnitrola/sugarcoat)

Making UI documentation a bit sweeter ✨

Sugarcoat was created to enable developers to produce rich UI documentation easily and with minimal up-keep. Sugarcoat works by parsing project files for documentation comments (similar to JavaDoc, JSDoc, etc.) and generates HTML or JSON that is organized and easy to read. Sugarcoat allows developers and designers to access up-to-date previews of UI elements, page components, project specific colors and typography, all in one place.

**Note**: This is still a work in-progress. Please file an issue if you encounter any issues or think a feature should be added.


# Index #

  - [Features](#features)
  - [Install](#install)
  - [Usage](#usage)
    - [Module](#module)
    - [CLI](#cli)
  - [Configuration](#configuration)
    - [`settings` Object](#settings-object)
    - [`sections` Array](#sections-array)
    - [Standardized File Format](#standardized-file-format)
  - [Code Comment Syntax](#code-comment-syntax)
  - [Templating](#templating)
    - [Custom Templating](#custom-templating)
  - [Roadmap](#roadmap)


---

# Features #

1. Can you parse css-preprocessor variables?

   Yes, we're able to grab the variables in your Less and SASS files. Just set the `type` option to `variable` in the appropriate `section` object within the `sections` array. See [`section.type`](#type) for more information.

2. Can I customize the default template that comes with Sugarcoat?
   
   No problem. The `template` option in the [`settings` Object](#settings-object) enables you to define your own layout, partials and static assets. Once, those are set, you can use the [`template`](#template) option in the [`section` Object](#section-object) which allows you to override the partial for a particular section.

3. Can I use my own template instead of the one that comes with Sugarcoat?

   Yes, you can use your own Handlebars template and partials. See the options [`template.layout`](#templatelayout) and [`template.partials`](#templatepartials) for more information.


# Install #

```bash
npm install --save sugarcoat
```


# Usage #

## Module ##

The Sugarcoat module takes an `config` object and returns a `Promise`. By default, the `resolve` callback provided to the `.then` method receives the expanded `config` object with the parsed sections data.

```js
var sugarcoat = require( 'sugarcoat' );

sugarcoat( config );

// or

sugarcoat( config ).then( function( data ) {
    console.log( data );
});
```

## CLI ##

You can also install `sugarcoat` globally (via `npm install -g`). The `sugarcoat` command takes a path to a configuration file which must export the configuration object via `module.exports`.

```bash
sugarcoat './my/config.js'
```

**Usage**

```bash
sugarcoat [flags] <configuration file>

Options:

  -h, --help     output usage information
  -o --output    Write output to process.stdout
  -V, --version  output the version number
```



# Configuration #


**Simple Example**

```js
{
  settings: {
    dest: 'my/project/pattern-library'
  },
  sections: [
    {
      title: 'Components',
      files: 'my/project/components/*.html'
    },
    {
      title: 'UI Kit',
      files: [
        'my/project/library/styles/global/*.scss',
        'my/project/library/styles/base/feedback.scss',
        '!my/project/library/styles/global/typography.scss'
      ]
    }
  ]
}
```

## `settings` Object ##

### `cwd` ###

Type: `String`  
Optional: `true`  
Default: `process.cwd()`  

This is the path to which the `dest` path is relative.

### `dest` ###

Type: `String`  
Optional: `true`  
Default: `null`  

Directory to which Sugarcoat will output the results. This path is relative to `cwd`. Sugarcoat will create any directories that do not already exist.

### `format` ###

Type: `String`  
Optional: `true`  
Default: `null`  

Format the return value from the Sugarcoat `Promise`. By default, the expanded `config` object is returned. Options are `'json'` and `'html'`. The `'json'` option simply runs `JSON.stringify` on the expanded `config` object. This is useful when using the `--output` flag in the CLI.

### `log` ###

Type: `Object`  
Optional: `true`  

Configure Sugarcoat's logging properties. See [npm/npmlog](https://github.com/npm/npmlog#loglevel) for more info.

### `template.cwd` ###
 
Type: `String`  
Optional: `true`  
Default: Sugarcoat's theme directory

The base path to which all `template` paths are relative. 

### `template.layout` ###

Type: `String`  
Optional: `true`  
Default: `main.hbs` (provided by Sugarcoat).  

Path (relative to `template.cwd`) to the Handlebars layout that will define the layout of the site.

### `template.partials` ###

Type: [Standardized File Format](#standardized-file-format)  
Optional: `true`

A standardized file format of one or more directory (not file) paths (relative to `template.cwd`) to register with Handlebars. If any partials use a [reserved name](#reserved-partial-names), the respective partial will override the one provided by Sugarcoat. If you choose to include an object or an array of objects, you must include a `src` and `options`. If you do not choose to include options through an object, Sugarcoat will default it's glob options to `nodir: true`. 

### `template.assets` ###

Type: `Array`  
Optional: `true`  
Default: `sugarcoat`  

An array of directory (not file) paths (relative to `template.cwd`) to the static assets to copy to `settings.dest`. If you would like to use Sugarcoat's assets, as well as your own, just include `sugarcoat` in the asset array.

**Advanced Example**

```js
{
  settings: {
    dest: 'my/project/pattern-library',
    template: {
      cwd: 'my/project/templates',
      layout: 'my-custom-layout.hbs',
      partials: [
        {
          src: 'my-partials',
          options: {
            nodir: false
        },
        {
          src: 'my-other-partials',
          options: {
            nodir: false
        }
      ],
      assets: [
        'sugarcoat',
        'js',
        'styles',
        'images'
      ]
    }
  }
}
```


## `sections` Array ##

Contains an `Array` of [Section Objects](#section-object)

### Section Object ###

#### `title` ####

Type: `String`  
Optional: `false`  

Title of section.

#### `files` ####

Type: [Standardized File Format](#standardized-file-format)  
Optional: `false`  

File(s) that contain documentation comments you would like to be parsed. Sugarcoat uses [globby](https://www.npmjs.com/package/globby) to enable pattern matching. You can also specify a negation pattern by using the `!` symbol at the beginning of the path.

**Examples**

Provide a single path:

```js
{
  title: 'Single File',
  files: 'my/project/library/styles/components/feedback.scss'
}
```

Match all files in a directory:

```js
{
  title: 'Multiple Files',
  files: 'my/project/library/styles/base/*'
}
```

Provide multiple paths/patterns:

```js
{
  title: 'Multiple Files',
  files: [
    'my/project/library/styles/base/*',
    'my/project/library/styles/components/feedback.scss',
    '!my/project/library/styles/base/colors.scss'
  ]
}
```

Provide an object in order to specify options to pass to [globby](https://www.npmjs.com/package/globby):

```js
{
  title: 'Multiple Files',
  files: {
    src: String|Object|Array,
    options: Object
  }
}
```

Provide an array of objects:

```js
{
  title: 'Multiple Files',
  files: [
    {
      src: String|Object|Array,
      options: Object
    },
    {...}
  ]
}
```

#### `type` ####

Type: `String`  
Optional: `true`  
Default: `default`  

If you'd like to parse a preprocessed stylesheet's variables, provide the `variable` option. This works with any `.scss` or `.less` file.

```js
{
    title: 'Project Defaults',
    files: 'my/project/library/styles/global/vars.scss',
    type: 'variable'
}
```

#### `template` ####

Type: `String`  
Optional: `true`  
Default: depends on the value of `type`  

The default partial is `section-default`, or `section-variable` when the `type` property is `variable`. You can also specify `section-color` or `section-typography`. If you'd like to designate your own partial, provide its name (must first be registered in [`template.partials`](#template-partials)). For more information on this, see [Custom Templating](#custom-templating).

```js
{
    title: 'Colors',
    files: 'demo/library/styles/global/colors.scss',
    type: 'variable',
    template: 'section-color'
}
```

## Standardized File Format ## 

Throughout Sugarcoat we use a standardized format for files. This format allows the user to express a file in three different ways: `String`, `Object`, `Array`. 

### `String` ###  

The `string` format is a string of path to a file or directory. 

**Example**
```js
files: 'my/project/library/js'
```

### `Object` ###  

The `object` format is an object composed of a property of `src` and optionaly a property of `options`. The property `src` is a string that is the path to the file or directory. The property `options` is an object with options that will be passed along to globby](https://www.npmjs.com/package/globby).

**Example**
```js
files: {
  src: 'my/project/library/js',
  options: {
    nodir: true
  }
}
```

### `Array` ###  

The `array` format can be composed of `strings` or `objects` (or a mix of both). Use the same format for [`string`](#string) and [`object`](#object) as stated above.  

**Example**
```js
files: [
  'my/project/library/js'.
  {
    src: 'my/project/library/css',
    options: {
      nodir: true
    }
  }
]
```

# Code Comment Syntax #

Sugarcoat adds some additional parsing options to [comment-parse](https://www.npmjs.com/package/comment-parser) in order to build the comment object. The following are reserved tags:

  - **`@title`** This tag's value is displayed in the default navigation partial
  
  - **`@example`** Takes a single or multiline code example

  - **`@modifier`** Takes the following word and adds it as the `name` key in the tag object. This word can be prefixed with any of the following characters: **`:.#`**

**Comment Example**

```
/**
 * @title Tooltip
 * @example
 *  <div class="tooltip">
 *    <span class="tooltip-content">This is a tooltip</span>
 *  </div>
 * @modifier .active enabled class on .tooltip
 */
```

**Example of a Comment Object**

```js
{ 
  line: 0,
  description: '',
  source: '@title Tooltip\n@example\n <div class="tooltip">\n   <span class="tooltip-content">This is a tooltip</span>\n </div>\n@modifier .active enabled class on .tooltip',
  context: '',
  tags: [ 
    { 
      tag: 'title',
      description: 'Tooltip',
      optional: false,
      type: '',
      name: '',
      line: 3,
      source: '@title Tooltip'
    },
    { 
      tag: 'example',
      description: '<div class="tooltip">\n<span class="tooltip-content">This is a tooltip</span>\n</div>',
      optional: false,
      type: '',
      name: '',
      line: 4,
      source: '@example\n<<div class="tooltip">\n<span class="tooltip-content">This is a tooltip</span>\n</div>' 
    },
    { 
      tag: 'modifier',
      name: '.active ',
      description: 'enabled class on .tooltip',
      optional: false,
      type: '',
      line: 10,
      source: '@modifier .active enabled class on .tooltip' 
    }
  ]
}
```

Sugarcoat takes the source code that follows a comment (up until the next comment), and applies it to the `context` key of the comment object.


**HTML**

For html files, Sugarcoat uses the same comment style. Since HTML doesn't support this style you'll need to wrap your documentation comments with an HTML-style comment. This is to maintain consistency.

**Comment Example (html)**

```html
<!--
/**
 * @title Some Component
 * @description This component has a description
 */
-->
<div class="some-component">
  <span>I'm a Component!</span>
</div>
```

**Comment Object**

```js
{
  line: 0,
  description: '',
  source: '@title Some Component\n@description This component has an interesting description',
  context: '\n<div class="some-component">\n  <span>I\'m a Component!</span>\n</div>',
  tags: [ 
    { 
      tag: 'title',
      description: 'Some Component',
      optional: false,
      type: '',
      name: '',
      line: 2,
      source: '@title Some Component'
    },
    { 
      tag: 'description',
      description: 'This component has an interesting description',
      optional: false,
      type: '',
      name: '',
      line: 3,
      source: '@description This component has an interesting description'
    }
  ]
}
```



# Templating #

Sugarcoat provides a default layout for your pattern library, rendering each parsed comment object with one of the following partials:

  - `section-default` Default rendering of a comment object.
  
  - `section-variable` Renders when `type: 'variable'` is provided - A list of variables and its associated value. 
  
  - `section-color` Renders when `template: 'section-color'` is provided - A list of color swatches with the associated variable name and color.
  
  - `section-typography` Renders when `template: 'section-typography'` is provided - Fonts and variable names with their examples.


Miscellaneous partials:

  - `nav` Outputs the main navigation - Lists `title` of each section object, nesting each comment object's `@title` tag. Used in the default `main.hbs` layout.
  
  - `head` Outputs links to Sugarcoat's default stylesheets:
    - [Furtive](http://furtive.co/): general styles
    - `pattern-lib`: specific styling for the `section-color` and `section-typography` section templates
    - [Prism](http://prismjs.com/) styles for code blocks
  
  - `footer` Outputs links to JavaScript files:
    - [Prism](http://prismjs.com/): formatting for code blocks

  - 'preview' outputs the example within your code comment block and a code block of the example code (this will have the prism formatting).

## Custom Templating ##

**Custom Layout**

If you'd like to provide your own layout, provide a path in `template.layout` (relative to `template.cwd`) in the `settings` object. 

**Custom Partials**

To register your own partials, add a directory path to the `template.partials` array (relative to `template.cwd`) in the `settings` object. If you provide a partial that uses a reserved name, Sugarcoat will use your partial instead of the one provided. 

### Reserved Partial Names #

  - head
  - nav
  - footer
  - section-color
  - section-typography
  - section-variable
  - section-default



# Roadmap #

## v1.0.0 ##

- [More styling and better structuring of rendered sections](/../../issues/15)
- [Robust example project](/../../issues/16)
- [Consolidating code comment syntax strategy](/../../issues/4)
- [Standardize file syntax in `settings` to align with the `file` syntax in section objects](/../../issues/17)
- [Add automated tests](/../../issues/18)


## v?.0.0 ##

- More refactoring of modules (functional, Promises)
- Ability to add custom tags (custom parser functions)
- Add support for JavaScript modules and components (React)
