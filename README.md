# ts-graft

ts-graft transposes TypeScript type definitions from type declaration files to
modules. It is especially useful in cases where you want to use existing type
definitions without having to redefine the type or reference a TypeScript lib
(e.g. the DOM lib).

- [Installation](#installation)
- [Use Case](#use-case)
- [Example](#example)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Command Line](#command-line)

## Installation

ts-graft should usually be installed as a dev dependency, since it will be used
to generate TypeScript source files.

```sh
npm install --save-dev ts-graft
```

## Use Case

The predominate use case for ts-graft is transposing type definitions from the
dom lib. Some projects provide a consistent interface which can be used in both
browser and server applications. Referencing the dom lib can be problematic for
server application developers because the set of globals defined in
`lib.dom.d.ts` and `@types/node` differ.

These differences manifest in frustrating ways for server application
developers. For example, if the same symbol is defined in both places, the
resulting type may be a union or overload, which may require server application
developers to apply superfluous type narrowing logic. Referencing the dom lib
causes TypeScript to treat browser globals which are not defined in
`@types/node` as valid, which can lead to programming errors when the symbol may
refer to a concrete type, such as a `function` or `class`, like `Headers`.

Type definitions in lib files are never exported because referencing a lib makes
all of the lib's type definitions available by default. This is why ts-graft is
needed - type definitions cannot be imported from lib files because they have no
exports.

## Example

Configure ts-graft with the list of type definitions _directly_ referenced by
your project, and the desired output location. You don't need to specify
transient types - ts-graft will automatically include type definitions
referenced by the types you specify.

**N.B. only _reusable_ types - interfaces and type aliases - are supported.**
Type definitions for `var`, `enum`, `function` and `class` are not supported.

**N.B.** TypeScript does not copy `.d.ts` files to its `outDir`, so use `.ts` as
the output extension if you want to include the generated declarations in your
project output.

```yaml
output:
  header: // Generated from ${package}@${version} ${source}
grafts:
  - source: typescript/lib/lib.dom.d.ts
    output: src/dom.ts
    include:
      # list interfaces and type aliases _directly_ referenced in your project
      - Blob
```

The `Blob` interface is defined like this in `lib.dom.d.ts`:

```ts
/** A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system. */
interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream;
  text(): Promise<string>;
}
```

The Blob interface references the `ReadableStream` interface. ts-graft traverses
these type references and includes them in the output. The configuration above
produces `src/dom.ts` like this:

<details>
<summary>Show generated <code>src/dom.ts</code></summary>

```ts
// Generated from typescript@4.1.2 typescript/lib/lib.dom.d.ts
// To regenerate, run the following command from the project root:
// npx lerna --scope=@simplewebauthn/typescript-types exec -- npm run extract-dom-types
/** A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system. */
export interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream;
  text(): Promise<string>;
}

/** This Streams API interface represents a readable stream of byte data. The Fetch API offers a concrete instance of a ReadableStream through the body property of a Response object. */
export interface ReadableStream<R = any> {
  readonly locked: boolean;
  cancel(reason?: any): Promise<void>;
  getReader(options: { mode: "byob" }): ReadableStreamBYOBReader;
  getReader(): ReadableStreamDefaultReader<R>;
  pipeThrough<T>(
    {
      writable,
      readable,
    }: { writable: WritableStream<R>; readable: ReadableStream<T> },
    options?: PipeOptions
  ): ReadableStream<T>;
  pipeTo(dest: WritableStream<R>, options?: PipeOptions): Promise<void>;
  tee(): [ReadableStream<R>, ReadableStream<R>];
}

export interface ReadableStreamBYOBReader {
  readonly closed: Promise<void>;
  cancel(reason?: any): Promise<void>;
  read<T extends ArrayBufferView>(
    view: T
  ): Promise<ReadableStreamReadResult<T>>;
  releaseLock(): void;
}

export interface ReadableStreamDefaultReader<R = any> {
  readonly closed: Promise<void>;
  cancel(reason?: any): Promise<void>;
  read(): Promise<ReadableStreamReadResult<R>>;
  releaseLock(): void;
}

/** This Streams API interface provides a standard abstraction for writing streaming data to a destination, known as a sink. This object comes with built-in backpressure and queuing. */
export interface WritableStream<W = any> {
  readonly locked: boolean;
  abort(reason?: any): Promise<void>;
  getWriter(): WritableStreamDefaultWriter<W>;
}

export interface PipeOptions {
  preventAbort?: boolean;
  preventCancel?: boolean;
  preventClose?: boolean;
  signal?: AbortSignal;
}

/** This Streams API interface is the object returned by WritableStream.getWriter() and once created locks the < writer to the WritableStream ensuring that no other streams can write to the underlying sink. */
export interface WritableStreamDefaultWriter<W = any> {
  readonly closed: Promise<void>;
  readonly desiredSize: number | null;
  readonly ready: Promise<void>;
  abort(reason?: any): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk: W): Promise<void>;
}

/** A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object. */
export interface AbortSignal extends EventTarget {
  /**
   * Returns true if this AbortSignal's AbortController has signaled to abort, and false otherwise.
   */
  readonly aborted: boolean;
  onabort: ((this: AbortSignal, ev: Event) => any) | null;
  addEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

export interface ReadableStreamReadValueResult<T> {
  done: false;
  value: T;
}

export interface ReadableStreamReadDoneResult<T> {
  done: true;
  value?: T;
}

/** EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them. */
export interface EventTarget {
  /**
   * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
   *
   * The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.
   *
   * When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.
   *
   * When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.
   *
   * When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.
   *
   * The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void;
  /**
   * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
   */
  dispatchEvent(event: Event): boolean;
  /**
   * Removes the event listener in target's event listener list with the same type, callback, and options.
   */
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;
}

/** An event which takes place in the DOM. */
export interface Event {
  /**
   * Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise.
   */
  readonly bubbles: boolean;
  cancelBubble: boolean;
  /**
   * Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method.
   */
  readonly cancelable: boolean;
  /**
   * Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise.
   */
  readonly composed: boolean;
  /**
   * Returns the object whose event listener's callback is currently being invoked.
   */
  readonly currentTarget: EventTarget | null;
  /**
   * Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise.
   */
  readonly defaultPrevented: boolean;
  /**
   * Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE.
   */
  readonly eventPhase: number;
  /**
   * Returns true if event was dispatched by the user agent, and false otherwise.
   */
  readonly isTrusted: boolean;
  returnValue: boolean;
  /** @deprecated */
  readonly srcElement: EventTarget | null;
  /**
   * Returns the object to which event is dispatched (its target).
   */
  readonly target: EventTarget | null;
  /**
   * Returns the event's timestamp as the number of milliseconds measured relative to the time origin.
   */
  readonly timeStamp: number;
  /**
   * Returns the type of event, e.g. "click", "hashchange", or "submit".
   */
  readonly type: string;
  readonly AT_TARGET: number;
  readonly BUBBLING_PHASE: number;
  readonly CAPTURING_PHASE: number;
  readonly NONE: number;
  /**
   * Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget.
   */
  composedPath(): EventTarget[];
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
  /**
   * If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.
   */
  preventDefault(): void;
  /**
   * Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
   */
  stopImmediatePropagation(): void;
  /**
   * When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.
   */
  stopPropagation(): void;
}

export interface AbortSignalEventMap {
  abort: Event;
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

export interface EventListenerOptions {
  capture?: boolean;
}

export interface EventListener {
  (evt: Event): void;
}

export interface EventListenerObject {
  handleEvent(evt: Event): void;
}

export type ReadableStreamReadResult<T> =
  | ReadableStreamReadValueResult<T>
  | ReadableStreamReadDoneResult<T>;
export declare type EventListenerOrEventListenerObject =
  | EventListener
  | EventListenerObject;
```

</details>

With a few lines of configuration, we're able to transpose hundreds of lines of
type definitions!

Notice that ts-graft automatically added `export` to each transposed type
definition, so that the types can be imported from the generated module.

## Configuration

ts-graft uses [cosmiconfig] to find and load the its configuration file. Refer
to the default [searchPlaces] for a list of acceptable configuration file names
and formats.

Example `.ts-graftrc.js`:

```js
module.exports = {
  grafts: [
    {
      source: "typescript/lib/lib.dom.d.ts",
      output: "src/graft/dom.ts",
      include: ["RequestInit", "RequestInfo", "Response"],
    },
  ],
};
```

## Usage

### Command Line

Currently, the `ts-graft` command is purely config file driven - there are no
sub-commands, options or arguments.

If you have a use case for such features, please open an issue or submit a pull
request.

[cosmiconfig]: https://github.com/davidtheclark/cosmiconfig
[searchplaces]: https://github.com/davidtheclark/cosmiconfig#searchplaces
