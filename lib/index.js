"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Component class
 *
 * @class
 *
 * @author Guillaume Gouessan <guillaume.gouessan@gmail.com>
 *
 * @example
 * // By using an object of definitions
 * const component = new Component(document.body, {SubComponentClass, OtherSubComponentClass})
 * // By using a method that returns a definition from a given string
 * const component = new Component(document.body, name => name === 'SubComponentClass' ? SubComponentClass : OtherSubComponentClass)
 */
var Component =
/*#__PURE__*/
function () {
  /**
   * Constructor
   * @param {Node} $el dom element that this component will be built around
   * @param {Object|Function} definitions Optional Object of Class Definitions or function that returns a Class Definitions from a given string
   */
  function Component($el) {
    var definitions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, Component);

    this.$el = $el;
    this.componentName = '';
    this.parent = null;
    this.root = this;
    this.definitions = [];
    this.refs = {};
    this._componentInstances = [];

    if (definitions) {
      this.init(definitions);
    }
  }
  /**
   * Returns dom done from css selector inside this component
   * @param {String} selector css selector
   * @returns {HTMLElement}
   */


  _createClass(Component, [{
    key: "$one",
    value: function $one(selector) {
      return this.$el.querySelector(selector);
    }
    /**
     * Returns an array of all node element matching selector that are inside this component
     * @param {String} selector css selector
     * @returns {Array<HTMLElement>}
     */

  }, {
    key: "$all",
    value: function $all(selector) {
      return [].slice.call(this.$el.querySelectorAll(selector));
    }
    /**
     * This will be called either by constructor if definitions are passed or by parent's parse method.
     * Definitions all automatically passed down to children components and you most likely will not need to
     * override or call this function.
     * @param {Object|Function} definitions Object of Class Definitions or function that returns a Class Definitions from a given string
     */

  }, {
    key: "init",
    value: function init(definitions) {
      this.definitions = definitions;
      this.parse();

      if (this.root === this) {
        this.onAppReady();
      }
    }
    /**
     * Will be called once whole nested parsing is done, DO NOT MANUALLY CALL THIS FUNCTION
     * if you override it don't forget call to super
     */

  }, {
    key: "onAppReady",
    value: function onAppReady() {
      this._componentInstances.forEach(function (component) {
        return component.onAppReady();
      });
    }
    /**
     * Call this function when you want to remove and destroy a component
     */

  }, {
    key: "dispose",
    value: function dispose() {
      this.disposeChildren();
      this.destroy();
    }
    /**
     * Call dispose function of each children components
     */

  }, {
    key: "disposeChildren",
    value: function disposeChildren() {
      this._componentInstances.forEach(function (component) {
        component.dispose();
      });

      this._componentInstances = [];
      this.refs = {};
    }
    /**
     * This will trigger a total reparsing of this component after killing its current childComponents, use at your own risk
     * @param {String} htmlString new HTML to parse
     */

  }, {
    key: "replaceContent",
    value: function replaceContent(htmlString) {
      this.disposeChildren();
      this.$el.innerHTML = htmlString;
      this.parse();
    }
    /**
     * Removes component from parent if it exists and deletes dom references
     */

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.parent && this.$el.parentNode && this.$el.parentNode === this.parent.$el) {
        this.parent.$el.removeChild(this.$el);
      }

      this.parent = null;
      this.$el = null;
    }
    /**
     * Returns first instance of Component with the name given as parameter
     * @param {String} componentName name of the component to find
     */

  }, {
    key: "findInstance",
    value: function findInstance(componentName) {
      var instance = this._componentInstances.filter(function (value) {
        return value.componentName === componentName;
      });

      if (instance && instance.length) return instance[0];

      for (var i = 0, l = this._componentInstances.length; i < l; i++) {
        instance = this._componentInstances[i].findInstance(componentName);
        if (instance !== undefined) return instance;
      }

      return undefined;
    }
    /**
     * Returns all instances of Component with the name given as parameter
     * @param {String} componentName name of the component to find
     */

  }, {
    key: "findAllInstances",
    value: function findAllInstances(componentName) {
      var instances = this._componentInstances.filter(function (value) {
        return value.componentName === componentName;
      });

      for (var i = 0, l = this._componentInstances.length; i < l; i++) {
        instances = instances.concat(this._componentInstances[i].findAllInstances(componentName));
      }

      return instances;
    }
    /**
     * Looks into this component children and creates its sub components if any is found.
     * Sub component instances with data-ref attributes will be added to the refs object of current Component.
     */

  }, {
    key: "parse",
    value: function parse() {
      var _this = this;

      findComponents(this.$el, function (node) {
        var componentName = node && node.getAttribute ? node.getAttribute('data-component') : '';
        var Ctor;
        var component;

        if (node.nodeType === 1 && componentName) {
          if (node.tagName === 'FORM') {
            console.warn("FORM tag does not support data-component. You should encapsulate the <form> with a <div> in component ".concat(componentName));
          }

          if (_this.definitions instanceof Function) {
            Ctor = _this.definitions(componentName);
          } else if (_this.definitions instanceof Object) {
            Ctor = _this.definitions[componentName];
          }

          if (Ctor) {
            node.removeAttribute('data-component');
            component = new Ctor(node);
            component.componentName = componentName;
            component.parent = _this;
            component.root = _this.root;
            component.init(_this.definitions);

            _this._componentInstances.push(component);

            if (node.getAttribute('data-ref')) {
              _this.refs[node.getAttribute('data-ref')] = component;
            }
          } else {
            console.warn("Can't find component '".concat(componentName, "'"));
          }
        }
      });
      this.ready();
    }
    /**
     * This is where you want to put the logic of the component
     */

  }, {
    key: "ready",
    value: function ready() {}
  }]);

  return Component;
}();
/**
 * Makes sure to put whatever obj is in an array if obj is not an array
 * @param {*} obj
 */


exports["default"] = Component;

function toArray(obj) {
  return obj == null ? [] : Array.isArray(obj) ? obj : [obj];
}
/**
 * Recursively Applies a callback on each Node that is found to be a Component
 * @param {Array} nodes an array of Node
 * @param {*} callback function to call on each Node that has data-component
 */


function findComponents(nodes, callback) {
  nodes = toArray(nodes);
  nodes = [].slice.call(nodes);
  var node;

  for (var i = 0, l = nodes.length; i < l; i++) {
    node = nodes[i];

    if (node && node.hasAttribute && node.hasAttribute('data-component')) {
      callback(node);
    } else if (node.childNodes && node.childNodes.length) {
      findComponents([].slice.call(node.childNodes), callback);
    }
  }
}