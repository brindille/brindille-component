import TestComponent from './components/_TestComponent'
import AnotherComponent from './components/_AnotherComponent'
import FooComponent from './components/_FooComponent'

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
