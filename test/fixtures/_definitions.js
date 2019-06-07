import TestComponent from './components/_TestComponent'
import AnotherComponent from './components/_AnotherComponent'

export const definitions = {
  TestComponent,
  AnotherComponent
}

export function definitionFunction (componentName) {
  switch (componentName) {
    case 'AnotherComponent':
      return AnotherComponent
    default:
      return TestComponent
  }
}
