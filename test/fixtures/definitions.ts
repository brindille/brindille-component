import Component from '../../src'

class AnotherComponent extends Component {}
class FooComponent extends Component {}
class TestComponent extends Component {}

export const definitions = {
  TestComponent,
  AnotherComponent,
  FooComponent
}

export function definitionFunction(componentName) {
  switch (componentName) {
    case 'AnotherComponent':
      return AnotherComponent
    case 'FooComponent':
      return FooComponent
    default:
      return TestComponent
  }
}
