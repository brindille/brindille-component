import TestComponent from './components/TestComponent'
import AnotherComponent from './components/AnotherComponent'

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
