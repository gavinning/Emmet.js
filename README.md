# Emmet.js
Use emmet syntax with Javascript.

### Version
Beta 1

### Licence
Emmet.js is under GNU General Public License v3.0.

### Requirements
Emmet.js does not require anything.

### Installation
Just include the script in your HTML page:
```html
<script type="text/javascript" src="path/emmet.js"></script>
```
Or, using the minified version:
```html
<script type="text/javascript" src="path/emmet.min.js"></script>
```

### Using
Emmet.js is based on the emmet syntax so [just use it](http://docs.emmet.io/abbreviations/syntax/). In these examples, I'll represent Node objects by their HTML syntax, but they are Node objects!

Create a div:
```javascript
var div=emmet('div');
// Returns: <div>
```

Create one hundred div-s:
```javascript
var divs=emmet('div*100');
// Returns: [<div></div>,<div></div>,...,<div></div>]
```

Create one hundred div incrementing the id (works with any attribute):
```javascript
var divs=emmet('div*100#d$');
// Returns: [<div id="d1"></div>,<div id="d2"></div>,...,<div id="d101"></div>]
```

Create one hundred div decrementing the id:
```javascript
var divs=emmet('div*100#d$@-');
// Returns: [<div id="d101"></div>,<div id="d100"></div>,...,<div id="d1"></div>]
```

Create a span with text "Hello" inside a div:
```javascript
var divAndSpan=emmet('div>span{Hello}');
// Returns: <div><span>Hello</span></div>
```

You can use Emmet.js from any Node in the DOM so it directly  appends the element(s) inside the Node (and return the element(s) as previously):
```javascript
document.body.emmet('div');
// Appends a div in the body and returns: <div>
```

Furthermore, you cans also use Emmet.js from any NodeList to directly append the element(s) inside each Node in the NodeList:
```javascript
document.getElementsByTagName('div').emmet('span');
// Append a span inside each div of the document
```

To have a more complete documentation, just go to [docs.emmet.io](http://docs.emmet.io/abbreviations/syntax/).

### Development
Emmet.js is open to any kind of contribution :)
