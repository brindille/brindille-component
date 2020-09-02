import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import browserEnv from 'browser-env'
import Component from '../src'
import sinon from 'sinon'
import templates from './fixtures/templates'
import { definitions, definitionFunction } from './fixtures/definitions'
import rewire from 'rewire'

/* -------------------------------------------------------------------------------------
  INIT BROWSER ENV
------------------------------------------------------------------------------------- */
browserEnv(['window', 'document', 'navigator'])

/* -------------------------------------------------------------------------------------
  UTILS
------------------------------------------------------------------------------------- */
// Util to quickly boot brindille component on body from template
function createRootComponent(template = '', definitions = null) {
  if (template) document.body.innerHTML = template
  return new Component(document.body, definitions)
}

// Creating a spy on console.warn displayed by our app
function spyOnWarnings(context) {
  context.warn = console.warn
  console.warn = sinon.spy()
  return console.warn
}

// Restoring console.warn from context
function restoreWarnings(context) {
  console.warn = context.warn
}

/* -------------------------------------------------------------------------------------
  TESTS
------------------------------------------------------------------------------------- */
const test = suite('Component')

let stubWarn
test.before.each(() => {
  stubWarn = sinon.stub(console, 'warn')
})
test.after.each(() => {
  stubWarn.restore()
})

test('Construct root component from empty body', () => {
  const rootComponent = createRootComponent()
  assert.ok(rootComponent)
})

test('Handle a data-component value that does not match a valid component by displaying warning in console', () => {
  const rootComponent = createRootComponent(templates.fake, definitions)
  assert.is(rootComponent.componentInstances.length, 0)
  assert.ok(console.warn['calledOnce'])
})

test('Handle a data-component value that matches a valid component', () => {
  const rootComponent = createRootComponent(templates.simple, definitions)
  assert.is(rootComponent.componentInstances.length, 1)
})

test('Handle data-component on form tag', () => {
  createRootComponent(templates.formNo, definitions)
  assert.ok(console.warn['calledOnce'])
})

test('Use function as definitions', () => {
  const rootComponent = createRootComponent(
    templates.simple,
    definitionFunction
  )
  assert.is(rootComponent.componentInstances.length, 1)
})

test('Use other types as definitions', () => {
  const rootComponent0 = createRootComponent(templates.simple, 'foo')
  const rootComponent1 = createRootComponent(templates.simple, 2)
  const rootComponent2 = createRootComponent(templates.simple, null)
  const rootComponent3 = createRootComponent(templates.simple, undefined)
  assert.is(rootComponent0.componentInstances.length, 0)
  assert.is(rootComponent1.componentInstances.length, 0)
  assert.is(rootComponent2.componentInstances.length, 0)
  assert.is(rootComponent3.componentInstances.length, 0)
  assert.is(console.warn['callCount'], 2)
})

test('Force component init with null definitions', () => {
  const rootComponent = createRootComponent(templates.simple, null)
  rootComponent.init(null)
  assert.is(rootComponent.componentInstances.length, 0)
  assert.is(console.warn['callCount'], 1)
})

test('Handle simple nested component', () => {
  const rootComponent = createRootComponent(templates.nested, definitions)
  assert.is(rootComponent.componentInstances.length, 1)
  assert.is(rootComponent.componentInstances[0].componentInstances.length, 1)
})

test('Nested components should be passed main definitions from parent', () => {
  const rootComponent = createRootComponent(templates.nested, definitions)
  assert.equal(
    rootComponent.componentInstances[0].definitions,
    rootComponent.definitions
  )
})

test('Refs attribute should be registered in parent', () => {
  const rootComponent = createRootComponent(templates.refs, definitions)
  assert.is(rootComponent.refs['test'], rootComponent.componentInstances[0])
})

test('Nested refs should only be attributed to direct parent', () => {
  const rootComponent = createRootComponent(templates.nestedRefs, definitions)
  assert.is(rootComponent.refs['test'], rootComponent.componentInstances[0])
  assert.is(
    rootComponent.refs['test'].refs['another'],
    rootComponent.componentInstances[0].componentInstances[0]
  )
  assert.not(rootComponent.refs['another'])
})

test('Dispose method should destroy component dom node', () => {
  const rootComponent = createRootComponent(templates.simple, definitions)
  rootComponent.dispose()
  assert.not(rootComponent.$el)
})

test('Dispose called on parent should also dispose all children', () => {
  const rootComponent = createRootComponent(templates.nestedRefs, definitions)
  const childComponent = rootComponent.refs['test']
  const childChildComponent = childComponent.refs.another
  rootComponent.dispose()
  assert.equal(rootComponent.refs, {})
  assert.equal(childComponent.refs, {})
  assert.not(childComponent.$el)
  assert.not(childChildComponent.$el)
})

test('replaceContent should launch a new parse on component', () => {
  const rootComponent = createRootComponent(templates.simple, definitions)
  rootComponent.replaceContent(templates.replace)
  assert.ok(rootComponent.refs['another'])
})

test('replaceContent should clear out refs and _componentInstances to replace them with new ones', () => {
  const rootComponent = createRootComponent(templates.refs, definitions)
  rootComponent.replaceContent(templates.replace)
  assert.ok(rootComponent.refs['another'])
  assert.not(rootComponent.refs['test'])
})

test('findInstance should return first direct child instance for a given component name', () => {
  const rootComponent = createRootComponent(
    templates.multipleInstances,
    definitions
  )
  const childOne = rootComponent.refs['testOne']
  const childTwo = rootComponent.refs['testTwo']
  const searchedInstance = rootComponent.findInstance('TestComponent')
  const searchedInstanceNoResult = rootComponent.findInstance('SomethingElse')

  assert.is(searchedInstance, childOne)
  assert.is.not(searchedInstance, childTwo)
  assert.not(searchedInstanceNoResult)
})

test('findInstance should return first nested child instance for a given component name', () => {
  const rootComponent = createRootComponent(
    templates.nestedMultipleInstances,
    definitions
  )
  const child = rootComponent.refs['child']
  const subChildOne = child.refs['testOne']
  const subChildTwo = child.refs['testTwo']
  const searchedInstance = rootComponent.findInstance('TestComponent')

  assert.is(searchedInstance, subChildOne)
  assert.is.not(searchedInstance, subChildTwo)
})

test('findAllInstances should return array of direct child instances for a given component name', () => {
  const rootComponent = createRootComponent(
    templates.multipleInstances,
    definitions
  )
  const childOne = rootComponent.refs['testOne']
  const childTwo = rootComponent.refs['testTwo']
  const searchedInstances = rootComponent.findAllInstances('TestComponent')
  const searchedInstancesNoResult = rootComponent.findAllInstances(
    'SomethingElse'
  )

  assert.is(searchedInstances[0], childOne)
  assert.is(searchedInstances[1], childTwo)
  assert.not(searchedInstancesNoResult.length)
})

test('findAllInstances should return array of nested child instances for a given component name', () => {
  const rootComponent = createRootComponent(
    templates.nestedMultipleInstances,
    definitions
  )
  const child = rootComponent.refs['child']
  const subChildOne = child.refs['testOne']
  const subChildTwo = child.refs['testTwo']
  const searchedInstances = rootComponent.findAllInstances('TestComponent')

  assert.is(searchedInstances[0], subChildOne)
  assert.is(searchedInstances[1], subChildTwo)
})

test('$one', () => {
  const rootComponent = createRootComponent(
    templates.simpleWithContent,
    definitions
  )
  assert.is(rootComponent.$one('.foo'), rootComponent.$el.querySelector('.foo'))
  assert.is(rootComponent.$one('.bar'), rootComponent.$el.querySelector('.bar'))
  assert.is.not(
    rootComponent.$one('.foo'),
    rootComponent.$el.querySelector('.bar')
  )
  assert.is.not(
    rootComponent.$one('.bar'),
    rootComponent.$el.querySelector('.two')
  )
})

test('$all', () => {
  const rootComponent = createRootComponent(
    templates.simpleWithContent,
    definitions
  )
  assert.is(rootComponent.$all('.bar').length, 2)
  assert.is.not(
    rootComponent.$all('.bar'),
    rootComponent.$el.querySelectorAll('.bar')
  )
  assert.is.not(
    rootComponent.$all('.bar'),
    [].slice.call(rootComponent.$el.querySelectorAll('.bar'))
  )
})

test('Root component auto assign', () => {
  const rootComponent = createRootComponent(
    templates.deeperNesting,
    definitions
  )
  const depth0 = rootComponent.refs['child']
  const depth1 = depth0.refs.test
  const depth2 = depth1.refs.foo
  assert.is(rootComponent.root, rootComponent)
  assert.is(depth0.root, rootComponent)
  assert.is(depth1.root, rootComponent)
  assert.is(depth2.root, rootComponent)
})

test('toArray', () => {
  const rewiredBrindilleComponent = rewire('../src')
  const toArray = rewiredBrindilleComponent.__get__('toArray')
  assert.equal(toArray(null), [])
  assert.equal(toArray(1), [1])
  assert.equal(toArray('a'), ['a'])
  assert.equal(toArray(['a']), ['a'])
})

test.run()
