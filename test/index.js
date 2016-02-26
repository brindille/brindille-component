import chai from 'chai';
import Component from '..';
import TestComponent from './components/TestComponent';
import AnotherComponent from './components/AnotherComponent';

const expect = chai.expect;
const definitions = {
  TestComponent: TestComponent,
  AnotherComponent: AnotherComponent
};

describe('Component', () => {
  it('Constructing root component from empty body', () => {
    var rootComponent = new Component(document.body);
    expect(rootComponent).to.be.ok;
  });

  it('Should be able to handle a data-component value that does not match a valid component', () => {
    document.body.innerHTML = '<div data-component="ComponentThatDoesNotExist"></div>';
    var rootComponent = new Component(document.body);
    expect(rootComponent._componentInstances.length).to.equal(0);
  });

  it('Should be able to handle a data-component value that matches a valid component', () => {
    document.body.innerHTML = '<div data-component="TestComponent"></div>';
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent._componentInstances.length).to.equal(1);
  });

  it('Should be able to handle recursive component', () => {
    document.body.innerHTML = '<div data-component="TestComponent"><div data-component="AnotherComponent"></div></div>';
    var rootComponent = new Component(document.body, definitions);
    expect(rootComponent._componentInstances.length).to.equal(1);
    expect(rootComponent._componentInstances[0]._componentInstances.length).to.equal(1);
  });
});
