# brindille-component
Simple class to recursively wrap javascript objects around html components.

## Installation
```bash
npm install brindille-component --save
```

## Usage

First you have to define a root component for you app. A component must be built around a dom node, this node will be passed as first parameter to the component. In the following example we build our root component around the body of our document.

```javascript
var Component = require('brindille-component');
var definitions = {};
var rootComponent = new Component(document.body, definitions);
```

At this point `rootComponent` is pretty much useless because we gave it an empty `definitions` object. Now if we want our root component to be able to have children sub components, we need to pass him definitions of all its sub components.

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
```javascript
this.$el // Dom node of our component
this.componentName // Class Name of the component (ex: 'MyComponent')
this.parent // Parent component instance if it exists (null for the rootComponent)
this.refs // Object containing references to data-ref child components, empty object if no child component was defined in the HTML.
```

## Methods
```javascript
dispose() {
  // This method should be overridden in any Component sub-class
  // This is where you should remove your event listeners, kill your timeouts, and basically everything that could prevent garbage collecting
  // Don't forget to call super.dipose() if you override it.
  // The super.dispose() will automatically call the dispose method of all the child sub-components.
}

replaceContent(htmlString) {
  // Clears out the current content of the component to replace it with htmlString.
  // It will trigger a new parsing and create new child components if any.
  // Previous child components will be disposed.
}

findInstance(componentName) {
  // Returns the first found instance of a component for a given componentName.
  // It will first look in first degree children then in children of children and so on...
}

findAllInstances(componentName) {
  // Returns an array of component instances for a given componentName.
  // It will first look in first degree children then in children of children and so on...
}
```

## Basic Example

First we need to define our sub-components, they should all be classes that extends `brindille-component`.

```javascript
var Component = require('brindille-component');

var MyCustomButton = (function() {
  function MyCustomButton($el) {
    Component.call(this, $el);

    // Define custom behaviour here
  }

  MyCustomButton.prototype = new Component();
  MyCustomButton.prototype.constructor = MyCustomButton;

  // Define custom methods here
})();


// Or in better looking ES6


import Component from 'brindille-component';

class MyCustomButton extends Component {
  constructor($el) {
    super($el);

    // Define custom behaviour here
  }

  // Define custom methods here
}
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
