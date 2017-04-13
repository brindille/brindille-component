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
export default class Component {
  /**
   * Constructor
   * @param {Node} $el dom element that this component will be built around
   * @param {Object|Function} definitions Optional Object of Class Definitions or function that returns a Class Definitions from a given string
   */
  constructor ($el, definitions = null) {
    this.$el = $el
    this.componentName = ''
    this.parent = null
    this.definitions = []
    this.refs = {}
    this._componentInstances = []

    if (definitions) {
      this.init(definitions)
    }
  }

  /**
   * This will be called either by constructor if definitions are passed or by parent's parse method.
   * Definitions all automatically passed down to children components and you most likely will not need to
   * override or call this function.
   * @param {Object|Function} definitions Object of Class Definitions or function that returns a Class Definitions from a given string
   */
  init (definitions) {
    this.definitions = definitions
    this.parse()
  }

  /**
   * Call this function when you want to remove and destroy a component
   */
  dispose () {
    this.disposeChildren()
    this.destroy()
  }

  /**
   * Call dispose function of each children components
   */
  disposeChildren () {
    this._componentInstances.forEach((component) => {
      component.dispose()
    })
    this._componentInstances = []
    this.refs = {}
  }

  /**
   * This will trigger a total reparsing of this component after killing its current childComponents, use at your own risk
   * @param {String} htmlString new HTML to parse
   */
  replaceContent (htmlString) {
    this.disposeChildren()
    this.$el.innerHTML = htmlString
    this.parse()
  }

  /**
   * Removes component from parent if it exists and deletes dom references
   */
  destroy () {
    if (this.parent && this.$el.parentNode && this.$el.parentNode === this.parent.$el) {
      this.parent.$el.removeChild(this.$el)
    }
    this.parent = null
    this.$el = null
  }

  /**
   * Returns first instance of Component with the name given as parameter
   * @param {String} componentName name of the component to find
   */
  findInstance (componentName) {
    let instance = this._componentInstances.filter(value => value.componentName === componentName)
    if (instance && instance.length) return instance[0]

    for (let i = 0, l = this._componentInstances.length; i < l; i++) {
      instance = this._componentInstances[i].findInstance(componentName)
      if (instance !== undefined) return instance
    }

    return undefined
  }

  /**
   * Returns all instances of Component with the name given as parameter
   * @param {String} componentName name of the component to find
   */
  findAllInstances (componentName) {
    let instances = this._componentInstances.filter(value => value.componentName === componentName)

    for (let i = 0, l = this._componentInstances.length; i < l; i++) {
      instances = instances.concat(this._componentInstances[i].findAllInstances(componentName))
    }

    return instances
  }

  /**
   * Looks into this component children and creates its sub components if any is found.
   * Sub component instances with data-ref attributes will be added to the refs object of current Component.
   */
  parse () {
    findComponents(this.$el, (node) => {
      const componentName = node && node.getAttribute ? node.getAttribute('data-component') : ''
      let Ctor
      let component
      if (node.nodeType === 1 && componentName) {
        if (node.tagName === 'FORM') {
          console.warn(`FORM tag does not support data-component. You should encapsulate the <form> with a <div> in component ${componentName}`)
        }

        if (this.definitions instanceof Function) {
          Ctor = this.definitions(componentName)
        } else if (this.definitions instanceof Object) {
          Ctor = this.definitions[componentName]
        }

        if (Ctor) {
          node.removeAttribute('data-component')
          component = new Ctor(node)
          component.init(this.definitions)
          component.componentName = componentName
          component.parent = this
          this._componentInstances.push(component)

          if (node.getAttribute('data-ref')) {
            this.refs[node.getAttribute('data-ref')] = component
          }
        } else {
          console.warn(`Can't find component '${componentName}'`)
        }
      }
    })

    this.ready()
  }

  /**
   * This is where you want to put the logic of the component
   */
  ready () {}
}

/**
 * Makes sure to put whatever obj is in an array if obj is not an array
 * @param {*} obj
 */
function toArray (obj) {
  return obj == null ? [] : (Array.isArray(obj) ? obj : [obj])
}

/**
 * Recursively Applies a callback on each Node that is found to be a Component
 * @param {Array} nodes an array of Node
 * @param {*} callback function to call on each Node that has data-component
 */
function findComponents (nodes, callback) {
  nodes = toArray(nodes)
  nodes = [].slice.call(nodes)
  let node
  for (let i = 0, l = nodes.length; i < l; i++) {
    node = nodes[i]
    if (node && node.hasAttribute && node.hasAttribute('data-component')) {
      callback(node)
    } else if (node.childNodes && node.childNodes.length) {
      findComponents([].slice.call(node.childNodes), callback)
    }
  }
}
