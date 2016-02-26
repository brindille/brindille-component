import chai from 'chai';
import Component from '..';
import TestComponent from './components/TestComponent';
import AnotherComponent from './components/AnotherComponent';

const expect = chai.expect;
const definitions = {
  TestComponent: TestComponent,
  AnotherComponent: AnotherComponent
};
const templates = {
  notExist: '<div data-component="ComponentThatDoesNotExist"></div>',
  simple: '<div data-component="TestComponent"></div>',
  nested: '<div data-component="TestComponent"><div data-component="AnotherComponent"></div></div>'
}

describe('Component', () => {
  var rootComponent = new Component(document.body);

  it('Constructing root component from empty body', () => {
    expect(rootComponent).to.be.ok;
  });

  it('Should be able to handle a data-component value that does not match a valid component', () => {
    document.body.innerHTML = templates.notExist;
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
});
