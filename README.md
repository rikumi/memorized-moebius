# memorized-moebius

A never-panic deep dark object with memorization mainly intended for mocking.

Try it out: `npx memorized-moebius`

## Purpose

In unit tests we have tons of dependency for just a single module under test. These dependencies are often mocked by hand, bringing additional complexity into writing tests.

To address this, we might use `Proxy` to create an "omnipotent" object to play a casual mock on them. We call this object a **Moebius** one.

**memorized-moebius** is a handy package mainly to standardize this behavior.

## Usage

### Default moebius builder

The default moebius builder will create a **default moebius object**.

Apart from [the common behavior](#common-behavior), the default moebius object is implemented with `toString`, `valueOf`, undefined `then` and undefined `calls`, and is wrapped with `jest.fn()` if there is a jest environment.

```ts
import buildDefaultMoebius from 'memorized-moebius';

const m = buildDefaultMoebius();

console.log(m.foo.toString()); // '[whatever Moebius]'
console.log(m.foo.bar().baz.valueOf()); // 42

// `then` is set to undefined intentionally to prevent being sniffed as a duck-type Promise.
console.log(typeof m.then); // 'undefined'

// `calls` is set to undefined intentionally to prevent being sniffed as a duck-type jest spy.
console.log(typeof m.calls); // 'undefined'
```

### Common behavior

All moebius objects built by **moebius builder**s will extend the following behavior:

- When being called as a function, returns **a new moebius object** built by the same builder;
- When a property is being retrieved, returns the previous value for the same key if it was set or retrieved before, or **a new moebius object** built by the same builder;
- When a property is being set, just set it anyway, whose value can be retrieved later.

This design ensures a consistent behavior inside the object, which imitates a "real" object that really contains the keys and values it should.

### Pipeline of a builder

Every moebius builder has a pipeline, starting from **a pure function that returns a new moebius object**, piping into some **preprocessors**, wrapped with a proxy, and then into **postprocessors**. All these pre- and post-processors are applied to every single object built by this builder.

You can modify the pipeline of a builder by `push`ing and `unshift`ing pipeline nodes into `builder.pipeline`.

```ts
// `buildDefaultMoebius` is an alias of `defaultBuilder.build`
import { defaultBuilder } from 'memorized-moebius';

// `unshift`ing into a pipeline defines a tranformation that is executed before `new Proxy()`.
// This is handy for changing the base object wrapped by the Proxy to another thing instead of a pure function.
defaultBuilder.pipeline.unshift((object) => ({}));

// `push`ing into a pipeline defines a transformation that is executed after `new Proxy()`.
// This is commonly used to modify the Proxy created by the builder.
defaultBuilder.pipeline.push((object) => {
  object.theAnswer = 42;
  return object;
});

// Let's see the results.
const m = defaultBuilder.build();
console.log(typeof m.foo.bar); // 'object'
console.log(m.what.is.theAnswer); // 42
```

### Create your builder from scratch

If you do not want the default pipeline nodes, apart from clearing the pipeline of `defaultBuilder`, you can also use `createMoebiusBuilder` exported function.

```ts
import { createMoebiusBuilder } from 'memorized-moebius';
const builder = createMoebiusBuilder();
const m = builder.build();
```
