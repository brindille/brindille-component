import walk from 'dom-walk';

export default class Component {
  constructor($el, definitions) {
    this.$el = $el;
    this.definitions = definitions || [];
    this.componentName = '';
    this.parent = null;
    this.refs = {};
    this._componentInstances = [];
    this.parse();
  }

  dispose() {
    this.disposeChildren();
    this.destroy();
  }

  disposeChildren() {
    this._componentInstances.forEach((component) => {
      component.dispose();
    });
    this._componentInstances = [];
    this.refs = {};
  }

  replaceContent(content) {
    const tempNode = document.createElement('div');
    tempNode.innerHTML = content;
    this.$el.innerHTML = tempNode.firstChild.innerHTML;
    this.parse();
  }

  destroy() {
    if (this.parent && this.$el.parentNode && this.$el.parentNode === this.parent.$el) {
      this.parent.$el.removeChild(this.$el);
    }
    this.parent = null;
    this.$el = null;
  }

  findInstance(componentName) {
    let instance = this._componentInstances.filter(value => value.componentName === componentName);
    if (instance && instance.length) return instance[0];

    for (let i = 0, l = this._componentInstances.length; i < l; i++) {
      instance = this._componentInstances[i].findInstance(componentName);
      if (instance !== undefined) return instance;
    }

    return undefined;
  }

  findAllInstances(componentName) {
    let instances = this._componentInstances.filter(value => value.componentName === componentName);
    let instance;

    if (instances && instances.length) return instances;

    instances = [];
    for (let i = 0, l = this._componentInstances.length; i < l; i++) {
      instance = this._componentInstances[i].findInstance(componentName);
      if (instance !== undefined) {
        instances.push(instance);
      }
    }

    return instances;
  }

  parse() {
    walk(this.$el, (node) => {
      const componentName = node && node.getAttribute ? node.getAttribute('data-component') : '';
      let Ctor;
      let component;


      if (node.nodeType === 1 && componentName) {
        if (node.tagName === 'FORM') {
          console.warn(`[Warning] FORM tag does not support data-component. You should encapsulate the <form> with a <div> in component ${componentName}`);
        }

        if (this.definitions instanceof Function) {
          Ctor = this.definitions(componentName);
        }
        else if (this.definitions instanceof Object) {
          Ctor = this.definitions[componentName];
        }

        if (Ctor) {
          node.removeAttribute('data-component');
          component = new Ctor(node, this.definitions);
          component.componentName = componentName;
          component.parent = this;
          this._componentInstances.push(component);

          if (node.getAttribute('data-ref')) {
            this.refs[node.getAttribute('data-ref')] = component;
          }
        }
        else {
          console.log(`[Warning] Can\'t find component '${componentName}'`);
        }
      }
    });

    this.onInit();
  }

  onInit() {
    // To override
  }
}
