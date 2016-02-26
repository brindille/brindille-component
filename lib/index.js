'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _domWalk = require('dom-walk');

var _domWalk2 = _interopRequireDefault(_domWalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = function () {
  function Component($el, definitions) {
    _classCallCheck(this, Component);

    this.$el = $el;
    this.componentName = '';
    this.parent = null;
    this.definitions = [];
    this.refs = {};
    this._componentInstances = [];

    if (definitions) {
      this.init(definitions);
    }
  }

  _createClass(Component, [{
    key: 'init',
    value: function init(definitions) {
      this.definitions = definitions;
      this.parse();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.disposeChildren();
      this.destroy();
    }
  }, {
    key: 'disposeChildren',
    value: function disposeChildren() {
      this._componentInstances.forEach(function (component) {
        component.dispose();
      });
      this._componentInstances = [];
      this.refs = {};
    }
  }, {
    key: 'replaceContent',
    value: function replaceContent(content) {
      var tempNode = document.createElement('div');
      tempNode.innerHTML = content;
      this.$el.innerHTML = tempNode.firstChild.innerHTML;
      this.parse();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.parent && this.$el.parentNode && this.$el.parentNode === this.parent.$el) {
        this.parent.$el.removeChild(this.$el);
      }
      this.parent = null;
      this.$el = null;
    }
  }, {
    key: 'findInstance',
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
  }, {
    key: 'findAllInstances',
    value: function findAllInstances(componentName) {
      var instances = this._componentInstances.filter(function (value) {
        return value.componentName === componentName;
      });
      var instance = undefined;

      if (instances && instances.length) return instances;

      instances = [];
      for (var i = 0, l = this._componentInstances.length; i < l; i++) {
        instance = this._componentInstances[i].findInstance(componentName);
        if (instance !== undefined) {
          instances.push(instance);
        }
      }

      return instances;
    }
  }, {
    key: 'parse',
    value: function parse() {
      var _this = this;

      (0, _domWalk2.default)(this.$el, function (node) {
        var componentName = node && node.getAttribute ? node.getAttribute('data-component') : '';
        var Ctor = undefined;
        var component = undefined;

        if (node.nodeType === 1 && componentName) {
          if (node.tagName === 'FORM') {
            console.warn('FORM tag does not support data-component. You should encapsulate the <form> with a <div> in component ' + componentName);
          }

          if (_this.definitions instanceof Function) {
            Ctor = _this.definitions(componentName);
          } else if (_this.definitions instanceof Object) {
            Ctor = _this.definitions[componentName];
          }

          if (Ctor) {
            node.removeAttribute('data-component');
            component = new Ctor(node);
            component.init(_this.definitions);
            component.componentName = componentName;
            component.parent = _this;
            _this._componentInstances.push(component);

            if (node.getAttribute('data-ref')) {
              _this.refs[node.getAttribute('data-ref')] = component;
            }
          } else {
            console.warn('Can\'t find component \'' + componentName + '\'');
          }
        }
      });

      this.ready();
    }
  }, {
    key: 'ready',
    value: function ready() {
      // To override
    }
  }]);

  return Component;
}();

exports.default = Component;