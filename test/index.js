import chai from 'chai';
import Component from '../src';
import TestComponent from './components/TestComponent';
import AnotherComponent from './components/AnotherComponent';

const expect = chai.expect;
const definitions = {
  TestComponent: TestComponent,
  AnotherComponent: AnotherComponent
};
const templates = {
  fake: '<div data-component="ComponentThatDoesNotExist"></div>',
  simple: '<div data-component="TestComponent"></div>',
  nested: '<div data-component="TestComponent"><div data-component="AnotherComponent"></div></div>',
  refs: '<div data-component="TestComponent" data-ref="test"></div>',
  nestedRefs: '<div data-component="TestComponent" data-ref="test"><div data-component="AnotherComponent" data-ref="another"></div></div>',
  multipleInstances: '<div data-component="TestComponent" data-ref="testOne"></div><div data-component="TestComponent" data-ref="testTwo"></div>',
  nestedMultipleInstances: '<div data-component="AnotherComponent" data-ref="child"><div data-component="TestComponent" data-ref="testOne"></div><div data-component="TestComponent" data-ref="testTwo"></div></div>'
}

describe('Component', () => {
  var rootComponent = new Component(document.body);

  it('Constructing root component from empty body', () => {
    expect(rootComponent).to.be.ok;
  });

  it('Should be able to handle a data-component value that does not match a valid component', () => {
    document.body.innerHTML = templates.fake;
    var rootComponent = new Component(document.body);
    expect(rootComponent._componentInstances.length).to.equal(0);
  });

  it('Should be able to handle a data-component value that matches a valid component', () => {
    document.body.innerHTML = templates.simple;
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent._componentInstances.length).to.equal(1);
  });

  it('Should be able to handle simple nested component', () => {
    document.body.innerHTML = templates.nested;
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent._componentInstances.length).to.equal(1);
    expect(rootComponent._componentInstances[0]._componentInstances.length).to.equal(1);
  });

  it('Nested components should be passed main definitions', () => {
    document.body.innerHTML = templates.nested;
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent.definitions).to.equal(definitions);
    expect(rootComponent._componentInstances[0].definitions).to.equal(definitions);
  });

  it('Refs attribute should be registered in parent', () => {
    document.body.innerHTML = templates.refs;
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent.refs.test).to.equal(rootComponent._componentInstances[0]);
  });

  it('Nested refs should only be attributed to direct parent', () => {
    document.body.innerHTML = templates.nestedRefs;
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent.refs.test).to.equal(rootComponent._componentInstances[0]);
    expect(rootComponent.refs.test.refs.another).to.equal(rootComponent._componentInstances[0]._componentInstances[0]);
    expect(rootComponent.refs.another).to.be.undefined;
  });

  it('Dispose method should destroy component dom node', () => {
    document.body.innerHTML = templates.simple;
    var rootComponent = new Component(document.body, definitions);
    rootComponent.dispose();
    expect(rootComponent.$el).to.be.null;
  });

  it('Dispose called on parent should also dispose all children', () => {
    document.body.innerHTML = templates.nestedRefs;
    var rootComponent = new Component(document.body, definitions);
    var childComponent = rootComponent.refs.test;
    var childChildComponent = childComponent.refs.another
    rootComponent.dispose();
    expect(rootComponent.refs).to.be.empty;
    expect(childComponent.refs).to.be.empty;
    expect(childComponent.$el).to.be.null;
    expect(childChildComponent.$el).to.be.null;
  });

  it('replaceContent should launch a new parse on component', () => {
    document.body.innerHTML = templates.simple;
    var rootComponent = new Component(document.body, definitions);
    rootComponent.replaceContent('<div data-component="AnotherComponent" data-ref="another"></div>');
    expect(rootComponent.refs.another).to.exist;
  });

  it('replaceContent should clear out refs and _componentInstances to replace them with new ones', () => {
    document.body.innerHTML = templates.refs;
    var rootComponent = new Component(document.body, definitions);
    rootComponent.replaceContent('<div data-component="AnotherComponent" data-ref="another"></div>');
    expect(rootComponent.refs.another).to.exist;
    expect(rootComponent.refs.test).to.not.exist;
  });

  it('findInstance should return first direct child instance for a given component name', () => {
    document.body.innerHTML = templates.multipleInstances;
    var rootComponent = new Component(document.body, definitions);
    var childOne = rootComponent.refs.testOne;
    var childTwo = rootComponent.refs.testTwo;
    var searchedInstance = rootComponent.findInstance('TestComponent');
    var searchedInstanceNoResult = rootComponent.findInstance('SomethingElse');

    expect(searchedInstance).to.equal(childOne);
    expect(searchedInstance).to.not.equal(childTwo);
    expect(searchedInstanceNoResult).to.be.undefined;
  });

  it('findInstance should return first nested child instance for a given component name', () => {
    document.body.innerHTML = templates.nestedMultipleInstances;
    var rootComponent = new Component(document.body, definitions);
    var child = rootComponent.refs.child;
    var subChildOne = child.refs.testOne;
    var subChildTwo = child.refs.testTwo;
    var searchedInstance = rootComponent.findInstance('TestComponent');

    expect(searchedInstance).to.equal(subChildOne);
    expect(searchedInstance).to.not.equal(subChildTwo);
  });

  it('findAllInstances should return array of direct child instances for a given component name', () => {
    document.body.innerHTML = templates.multipleInstances;
    var rootComponent = new Component(document.body, definitions);
    var childOne = rootComponent.refs.testOne;
    var childTwo = rootComponent.refs.testTwo;
    var searchedInstances = rootComponent.findAllInstances('TestComponent');
    var searchedInstancesNoResult = rootComponent.findAllInstances('SomethingElse');

    expect(searchedInstances[0]).to.equal(childOne);
    expect(searchedInstances[1]).to.equal(childTwo);
    expect(searchedInstancesNoResult).to.be.empty;
  });

  it('findAllInstances should return array of nested child instances for a given component name', () => {
    document.body.innerHTML = templates.nestedMultipleInstances;
    var rootComponent = new Component(document.body, definitions);
    var child = rootComponent.refs.child;
    var subChildOne = child.refs.testOne;
    var subChildTwo = child.refs.testTwo;
    var searchedInstances = rootComponent.findAllInstances('TestComponent');

    expect(searchedInstances[0]).to.equal(subChildOne);
    expect(searchedInstances[1]).to.equal(subChildTwo);
  });
});
