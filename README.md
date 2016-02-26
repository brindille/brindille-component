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

A component will parse its own node to find child-nodes with the `data-component` attribute.

```html
<body>
  <div data-component="SubComponent"></div>
</body>
```

When this attribute is found it will create a new Component with the corresponding definition. This means that if you want a node with `data-component` set to `SubComponent`, you need to have a class definition of SubComponent in the `definitions` object passed to the root component.

```javascript
var Component = require('brindille-component');

var definitions = {
  SubComponent: /* class definition that extends brindille-component */
};
var rootComponent = new Component(document.body, definitions);
```

It's possible to have nested Components. Each component will only be referenced in its direct parent Component.

You only have to worry about the definitions for the root component, they will automatically be passed down children components.

## Properties
### $el
### componentName
### parent
### refs

## Methods
### findInstance
### findAllInstances

## Basic Example

First we need to define our sub-components, they should all be classes that extends `brindille-component`.

```javascript
var Component = require('brindille-component');

var MyCustomButton = (function() {
  function MyCustomButton($el) {
    Component.call(this, $el);

    this.bindedOnClick = this.onClick.bind(this);

    this.$el.addEventListener('click', this.bindedOnClick);
  }

  MyCustomButton.prototype = new Component();
  MyCustomButton.prototype.constructor = MyCustomButton;

  MyCustomButton.prototype.onClick = function() {
    console.log('Button ' + this.$el.getAttribute('id') + ' was clicked');
  };

  MyCustomButton.prototype.dispose = function() {
    this.$el.removeEventListener('click', this.bindedOnClick);
    Component.dispose.call(this);
  };
})();
```


Then in our HTML we invoke our sub-component (here we actually have two instances of the same button component).
```html
<body>
  <div id="button1" data-component="MyCustomButton"></div>
  <div id="button2" data-component="MyCustomButton"></div>
</body>
```


Finally in our script we define the root component with the proper definitions.
```javascript
var Component = require('brindille-component');

var definitions = {
  MyCustomButton: require('./MyCustomButton')
};
var rootComponent = new Component(document.body, definitions);
```
