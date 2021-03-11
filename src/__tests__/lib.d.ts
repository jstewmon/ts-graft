interface Foo {
  bar: Bar;
}

interface Bar {
  inline: {
    prop: Baz;
  };
}

interface Callable {
  (arg: Baz): void;
}

type Baz = Qux | string;
type Qux = number;

declare let foo: Foo;
declare function getBar(foo: Foo): Bar;
declare class Class {
  prop: string;
}
