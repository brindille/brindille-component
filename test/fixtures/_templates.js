export default {
  fake: `
    <div data-component="ComponentThatDoesNotExist"></div>
  `,
  simple: `
    <div data-component="TestComponent"></div>
  `,
  simpleWithContent: `
    <div data-component="TestComponent">
      <div class="foo"></div>
      <div class="bar one"></div>
      <div class="bar two"></div>
    </div>
  `,
  nested: `
    <div data-component="TestComponent">
      <div data-component="AnotherComponent"></div>
    </div>
  `,
  formNo: `
    <form data-component="TestComponent"></form>
  `,
  formYes: `
    <div data-component="TestComponent">
      <form></form>
    </div>
  `,
  refs: `
    <div data-component="TestComponent" data-ref="test"></div>
  `,
  nestedRefs: `
    <div data-component="TestComponent" data-ref="test">
      <div data-component="AnotherComponent" data-ref="another"></div>
    </div>
  `,
  multipleInstances: `
    <div data-component="TestComponent" data-ref="testOne"></div>
    <div data-component="TestComponent" data-ref="testTwo"></div>
  `,
  nestedMultipleInstances: `
    <div data-component="AnotherComponent" data-ref="child">
      <div data-component="TestComponent" data-ref="testOne"></div>
      <div data-component="TestComponent" data-ref="testTwo"></div>
    </div>
  `,
  deeperNesting: `
    <div data-component="AnotherComponent" data-ref="child">
      <div data-component="TestComponent" data-ref="test">
        <div data-component="FooComponent" data-ref="foo"></div>
      </div>
    </div>
  `,
  replace: `
    <div data-component="AnotherComponent" data-ref="another"></div>
  `
}
