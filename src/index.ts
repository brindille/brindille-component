type ComponentCtor = new () => Component
type DefinitionGetter = (id: string) => ComponentCtor
interface DefinitionObject {
  [id: string]: ComponentCtor
}

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
  parent: Component
  root: Component

  componentName: string = ''
  refs: Object = {}
  definitions: DefinitionGetter

  private _componentInstances: Component[] = []

  /**
   * Constructor
   * @param {Node} $el dom element that this component will be built around
   * @param {Object|Function} definitions Optional Object of Class Definitions or function that returns a Class Definitions from a given string
   */
  constructor(
    public $el,
    definitions: DefinitionObject | DefinitionGetter = null
  ) {
    this.root = this
    this.parent = null
    if (definitions) this.init(definitions)
  }

  /**
   * Returns dom done from css selector inside this component
   * @param {String} selector css selector
   * @returns {HTMLElement}
   */
  $one(selector: string): HTMLElement {
    return this.$el.querySelector(selector)
  }

  /**
   * Returns an array of all node element matching selector that are inside this component
   * @param {String} selector css selector
   * @returns {Array<HTMLElement>}
   */
  $all(selector: string): HTMLElement[] {
    return [].slice.call(this.$el.querySelectorAll(selector))
  }

  /**
   * This will be called either by constructor if definitions are passed or by parent's parse method.
   * Definitions all automatically passed down to children components and you most likely will not need to
   * override or call this function.
   * @param {Object|Function} definitions Object of Class Definitions or function that returns a Class Definitions from a given string
   */
  init(definitions: DefinitionObject | DefinitionGetter = null): void {
    if (definitions instanceof Function) {
      this.definitions = definitions
    } else if (definitions == null) {
      this.definitions = () => null
    } else {
      this.definitions = name => definitions[name]
    }

    this.parse()
    if (this.root === this) {
      this.onAppReady()
    }
  }

  /**
   * Will be called once whole nested parsing is done, DO NOT MANUALLY CALL THIS FUNCTION
   * if you override it don't forget call to super
   */
  onAppReady(): void {
    this._componentInstances.forEach(component => component.onAppReady())
  }

  /**
   * Call this function when you want to remove and destroy a component
   */
  dispose(): void {
    this.disposeChildren()
    this.destroy()
  }

  /**
   * Call dispose function of each children components
   */
  disposeChildren(): void {
    this._componentInstances.forEach(component => {
      component.dispose()
    })
    this._componentInstances = []
    this.refs = {}
  }

  /**
   * This will trigger a total reparsing of this component after killing its current childComponents, use at your own risk
   * @param {String} htmlString new HTML to parse
   */
  replaceContent(htmlString: string): void {
    this.disposeChildren()
    this.$el.innerHTML = htmlString
    this.parse()
  }

  /**
   * Removes component from parent if it exists and deletes dom references
   */
  destroy(): void {
    if (
      this.parent &&
      this.$el.parentNode &&
      this.$el.parentNode === this.parent.$el
    ) {
      this.parent.$el.removeChild(this.$el)
    }
    this.parent = null
    this.$el = null
  }

  /**
   * Returns first instance of Component with the name given as parameter
   * @param {String} componentName name of the component to find
   * @returns {Component} Component instance found, null if no result
   */
  findInstance(componentName: string): Component {
    // Start By looking in direct children
    const instance = this._componentInstances.filter(
      value => value.componentName === componentName
    )
    if (instance && instance.length) return instance[0]

    // If nothing found, try in children's children
    for (let i = 0, l = this._componentInstances.length; i < l; i++) {
      const childInstance = this._componentInstances[i].findInstance(
        componentName
      )
      if (childInstance) return childInstance
    }

    // Still nothing means no instance found
    return null
  }

  /**
   * Returns all instances of Component with the name given as parameter
   * @param {String} componentName name of the component to find
   * @returns {Component[]} an array of Components
   */
  findAllInstances(componentName: string): Component[] {
    let instances = this._componentInstances.filter(
      value => value.componentName === componentName
    )

    for (let i = 0, l = this._componentInstances.length; i < l; i++) {
      instances = instances.concat(
        this._componentInstances[i].findAllInstances(componentName)
      )
    }

    return instances
  }

  /**
   * Looks into this component children and creates its sub components if any is found.
   * Sub component instances with data-ref attributes will be added to the refs object of current Component.
   */
  parse(): void {
    findComponents(this.$el, node => {
      const componentName =
        node && node.getAttribute ? node.getAttribute('data-component') : ''
      let Ctor
      let component
      if (node.nodeType === 1 && componentName) {
        if (node.tagName === 'FORM') {
          console.warn(
            `FORM tag does not support data-component. You should encapsulate the <form> with a <div> in component ${componentName}`
          )
        }

        Ctor = this.definitions(componentName)

        if (Ctor) {
          node.removeAttribute('data-component')
          component = new Ctor(node)
          component.componentName = componentName
          component.parent = this
          component.root = this.root
          component.init(this.definitions)
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
  ready(): void {}

  get componentInstances(): Component[] {
    return this._componentInstances
  }
}

/**
 * Makes sure to put whatever obj is in an array if obj is not an array
 * @param {*} obj
 */
function toArray(obj: any) {
  return obj == null ? [] : Array.isArray(obj) ? obj : [obj]
}

/**
 * Recursively Applies a callback on each Node that is found to be a Component
 * @param {Array} nodes an array of Node
 * @param {*} callback function to call on each Node that has data-component
 */
function findComponents(nodes, callback) {
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
