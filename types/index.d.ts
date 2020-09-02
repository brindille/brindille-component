declare type ComponentCtor = new () => Component;
declare type DefinitionGetter = (id: string) => ComponentCtor;
interface DefinitionObject {
    [id: string]: ComponentCtor;
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
    $el: any;
    parent: Component;
    root: Component;
    componentName: string;
    refs: Object;
    definitions: DefinitionGetter;
    private _componentInstances;
    /**
     * Constructor
     * @param {Node} $el dom element that this component will be built around
     * @param {Object|Function} definitions Optional Object of Class Definitions or function that returns a Class Definitions from a given string
     */
    constructor($el: any, definitions?: DefinitionObject | DefinitionGetter);
    /**
     * Returns dom done from css selector inside this component
     * @param {String} selector css selector
     * @returns {HTMLElement}
     */
    $one(selector: string): HTMLElement;
    /**
     * Returns an array of all node element matching selector that are inside this component
     * @param {String} selector css selector
     * @returns {Array<HTMLElement>}
     */
    $all(selector: string): HTMLElement[];
    /**
     * This will be called either by constructor if definitions are passed or by parent's parse method.
     * Definitions all automatically passed down to children components and you most likely will not need to
     * override or call this function.
     * @param {Object|Function} definitions Object of Class Definitions or function that returns a Class Definitions from a given string
     */
    init(definitions?: DefinitionObject | DefinitionGetter): void;
    /**
     * Will be called once whole nested parsing is done, DO NOT MANUALLY CALL THIS FUNCTION
     * if you override it don't forget call to super
     */
    onAppReady(): void;
    /**
     * Call this function when you want to remove and destroy a component
     */
    dispose(): void;
    /**
     * Call dispose function of each children components
     */
    disposeChildren(): void;
    /**
     * This will trigger a total reparsing of this component after killing its current childComponents, use at your own risk
     * @param {String} htmlString new HTML to parse
     */
    replaceContent(htmlString: string): void;
    /**
     * Removes component from parent if it exists and deletes dom references
     */
    destroy(): void;
    /**
     * Returns first instance of Component with the name given as parameter
     * @param {String} componentName name of the component to find
     * @returns {Component} Component instance found, null if no result
     */
    findInstance(componentName: string): Component;
    /**
     * Returns all instances of Component with the name given as parameter
     * @param {String} componentName name of the component to find
     * @returns {Component[]} an array of Components
     */
    findAllInstances(componentName: string): Component[];
    /**
     * Looks into this component children and creates its sub components if any is found.
     * Sub component instances with data-ref attributes will be added to the refs object of current Component.
     */
    parse(): void;
    /**
     * This is where you want to put the logic of the component
     */
    ready(): void;
    get componentInstances(): Component[];
}
export {};
