# brindille-component
Simple class to recursively wrap javascript objects around html components.

## Installation
```bash
npm install brindille-component --save
```

## Usage

First you have to define a root component for you app. A component must be built around a dom node, this node will be passed as first parameter to the component. In the following example we build our root component around the body or our document.

```javascript
var Component = require('brindille-component');
var definitions = {};
var rootComponent = new Component(document.body, definitions);
```

At this point rootComponent is pretty much useless because we gave him an empty `definitions` object. Now if we want our root component to be able to have children sub components, we need to pass him definitions of all its sub components.

A component will parse its own node to find child-nodes with the `data-attribute` param. When found it will create a new Component with the corresponding definition. This means that if you wand a node with `data-attribute` set to `SubComponent`, you need to have a class definition of SubComponent in the `definitions` object passed to the root component.

## Quick Example

`./MyCustomButton.js`
```javascript
var Component = require('brindille-component');

var MyCustomButton = (function() {
  function MyCustomButton($el) {
    Component.call(this, $el);
  }

  MyCustomButton.prototype = new Component();
  MyCustomButton.prototype.constructor = MyCustomButton;
})();
```


`./index.html`
```html
<body>
  <div data-component="MyCustomButton"></div>
</body>
```


`./index.js`
```javascript
var definitions = {
  MyCustomButton: require('./MyCustomButton')
};
var rootComponent = new Component(document.body, definitions);
```

You only have to worry about the definitions for the root component, they will automatically be passed down children components.
