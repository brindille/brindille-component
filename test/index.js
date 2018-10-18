import test from 'ava'
import sinon from 'sinon'
import Component from '../src'
import templates from './fixtures/templates'
import {definitions, definitionFunction} from './fixtures/definitions'

/* -------------------------------------------------------------------------------------
  UTILS
------------------------------------------------------------------------------------- */
// Util to quickly boot brindille component on body from template
function createRootComponent (template, definitions = {}) {
  if (template) document.body.innerHTML = template
  return new Component(document.body, definitions)
}

// Creating a spy on console.warn displayed by our app
function spyOnWarnings (t) {
  t.context.warn = console.warn
  console.warn = sinon.spy()
  return console.warn
}

// Restoring console.warn from context
function restoreWarnings (t) {
  console.warn = t.context.warn
}

/* -------------------------------------------------------------------------------------
  TESTS
------------------------------------------------------------------------------------- */
test('Construct root component from empty body', t => {
  const rootComponent = createRootComponent()
  t.truthy(rootComponent)
})

test('Handle a data-component value that does not match a valid component by displaying warning in console', t => {
  const warnings = spyOnWarnings(t)
  const rootComponent = createRootComponent(templates.fake)
  t.is(rootComponent._componentInstances.length, 0)
  t.true(warnings.calledOnce)
  restoreWarnings(t)
})

test('Handle a data-component value that matches a valid component', t => {
  const rootComponent = createRootComponent(templates.simple, definitions)
  t.is(rootComponent._componentInstances.length, 1)
})

test('Handle data-component on form tag', t => {
  const warnings = spyOnWarnings(t)
  createRootComponent(templates.formNo, definitions)
  t.true(warnings.calledOnce)
  restoreWarnings(t)
})

test('Use function as definitions', t => {
  const rootComponent = createRootComponent(templates.simple, definitionFunction)
  t.is(rootComponent._componentInstances.length, 1)
})

test('Handle simple nested component', t => {
  const rootComponent = createRootComponent(templates.nested, definitions)
  t.is(rootComponent._componentInstances.length, 1)
  t.is(rootComponent._componentInstances[0]._componentInstances.length, 1)
})

test('Nested components should be passed main definitions from parent', t => {
  const rootComponent = createRootComponent(templates.nested, definitions)
  t.deepEqual(rootComponent.definitions, definitions)
  t.deepEqual(rootComponent._componentInstances[0].definitions, definitions)
})

test('Refs attribute should be registered in parent', t => {
  const rootComponent = createRootComponent(templates.refs, definitions)
  t.is(rootComponent.refs.test, rootComponent._componentInstances[0])
})

test('Nested refs should only be attributed to direct parent', t => {
  const rootComponent = createRootComponent(templates.nestedRefs, definitions)
  t.is(rootComponent.refs.test, rootComponent._componentInstances[0])
  t.is(rootComponent.refs.test.refs.another, rootComponent._componentInstances[0]._componentInstances[0])
  t.falsy(rootComponent.refs.another)
})

test('Dispose method should destroy component dom node', t => {
  const rootComponent = createRootComponent(templates.simple, definitions)
  rootComponent.dispose()
  t.falsy(rootComponent.$el)
})

test('Dispose called on parent should also dispose all children', t => {
  const rootComponent = createRootComponent(templates.nestedRefs, definitions)
  const childComponent = rootComponent.refs.test
  const childChildComponent = childComponent.refs.another
  rootComponent.dispose()
  t.deepEqual(rootComponent.refs, {})
  t.deepEqual(childComponent.refs, {})
  t.falsy(childComponent.$el)
  t.falsy(childChildComponent.$el)
})

test('replaceContent should launch a new parse on component', t => {
  const rootComponent = createRootComponent(templates.simple, definitions)
  rootComponent.replaceContent(templates.replace)
  t.truthy(rootComponent.refs.another)
})

test('replaceContent should clear out refs and _componentInstances to replace them with new ones', t => {
  const rootComponent = createRootComponent(templates.refs, definitions)
  rootComponent.replaceContent(templates.replace)
  t.truthy(rootComponent.refs.another)
  t.falsy(rootComponent.refs.test)
})

test('findInstance should return first direct child instance for a given component name', t => {
  const rootComponent = createRootComponent(templates.multipleInstances, definitions)
  const childOne = rootComponent.refs.testOne
  const childTwo = rootComponent.refs.testTwo
  const searchedInstance = rootComponent.findInstance('TestComponent')
  const searchedInstanceNoResult = rootComponent.findInstance('SomethingElse')

  t.is(searchedInstance, childOne)
  t.not(searchedInstance, childTwo)
  t.falsy(searchedInstanceNoResult)
})

test('findInstance should return first nested child instance for a given component name', t => {
  const rootComponent = createRootComponent(templates.nestedMultipleInstances, definitions)
  const child = rootComponent.refs.child
  const subChildOne = child.refs.testOne
  const subChildTwo = child.refs.testTwo
  const searchedInstance = rootComponent.findInstance('TestComponent')

  t.is(searchedInstance, subChildOne)
  t.not(searchedInstance, subChildTwo)
})

test('findAllInstances should return array of direct child instances for a given component name', t => {
  const rootComponent = createRootComponent(templates.multipleInstances, definitions)
  const childOne = rootComponent.refs.testOne
  const childTwo = rootComponent.refs.testTwo
  const searchedInstances = rootComponent.findAllInstances('TestComponent')
  const searchedInstancesNoResult = rootComponent.findAllInstances('SomethingElse')

  t.is(searchedInstances[0], childOne)
  t.is(searchedInstances[1], childTwo)
  t.falsy(searchedInstancesNoResult.refs)
})

test('findAllInstances should return array of nested child instances for a given component name', t => {
  const rootComponent = createRootComponent(templates.nestedMultipleInstances, definitions)
  const child = rootComponent.refs.child
  const subChildOne = child.refs.testOne
  const subChildTwo = child.refs.testTwo
  const searchedInstances = rootComponent.findAllInstances('TestComponent')

  t.is(searchedInstances[0], subChildOne)
  t.is(searchedInstances[1], subChildTwo)
})

test('$one', t => {
  const rootComponent = createRootComponent(templates.simpleWithContent, definitions)
  t.is(rootComponent.$one('.foo'), rootComponent.$el.querySelector('.foo'))
  t.is(rootComponent.$one('.bar'), rootComponent.$el.querySelector('.bar'))
  t.not(rootComponent.$one('.foo'), rootComponent.$el.querySelector('.bar'))
  t.not(rootComponent.$one('.bar'), rootComponent.$el.querySelector('.two'))
})

test('$all', t => {
  const rootComponent = createRootComponent(templates.simpleWithContent, definitions)
  t.is(rootComponent.$all('.bar').length, 2)
  t.not(rootComponent.$all('.bar'), rootComponent.$el.querySelectorAll('.bar'))
  t.not(rootComponent.$all('.bar'), [].slice.call(rootComponent.$el.querySelectorAll('.bar')))
})
