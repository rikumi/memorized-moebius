# memorized-moebius

具有记忆力、永不异常的黑洞对象，主要用于单元测试 mock。

本地试用：`npx memorized-moebius`

## 背景

单元测试中，一个模块往往存在很多依赖，这些依赖需要被 mock，这给我们带来很多额外的复杂度。为了解决这个问题，我们一般会用 Proxy 构造一个「万能对象」，作为一个简易的 mock，我们称之为 Moebius（莫比乌斯）对象。

**memorized-moebius** 是一个易于使用的库，主要用于将这一类操作标准化。

## 用法

### 默认 moebius builder

默认的 moebius builder 可以构造一个默认 moebius 对象。

除了[通用行为](#通用行为)，默认的 moebius 对象实现了 `toString`、`valueOf`，且 `then` 和 `calls` 为 `undefined`；另外，如果在 jest 环境下，它还会被 jest.fn() 封装起来。

```ts
import buildDefaultMoebius from 'memorized-moebius';

const m = buildDefaultMoebius();

console.log(m.foo.toString()); // '[whatever Moebius]'
console.log(m.foo.bar().baz.valueOf()); // 42

// `then` 被设为 undefined，以防被识别为鸭子类型的 Promise 对象。
console.log(typeof m.then); // 'undefined'

// `calls` 被设为 undefined，以防被识别为鸭子类型的 jest.spy 函数。
console.log(typeof m.calls); // 'undefined'
```

### 通用行为

所有被 moebius builder 构造的 moebius 对象都会继承下列行为：

- 如果被当作函数调用，会返回同一 builder 构造的、新的 moebius 对象；
- 如果被取属性，若之前存/取过该属性，则返回之前存/取过的值，否则返回同一 builder 构造的、新的 moebius 对象；
- 如果被设置属性，则该属性会被存下来，后续可以取到。

这一设计保证了 moebius 对象内部的一致性，从而尽可能模仿被 mock 到的真实对象，好像这些被用到的属性都真实存在一样。

### builder 的 pipeline

每一个 moebius builder 都包含有一个 pipeline 数组，数组中包含了创建 moebius 对象的所有步骤：首先构造一个**能返回新 moebius 对象的函数**，然后把这个函数传入一些**预处理器**，然后将返回的值封装成 Proxy，最后再传入一些**后置处理器**。这一流水线适用于这个 builder 创建的所有 moebius 对象。

使用数组的 `unshift` 和 `push` 操作，可以在 `builder.pipeline` 中添加预处理器和后置处理器。编写预处理器和后置处理器时，别忘了返回处理完成的对象。

```ts
// `buildDefaultMoebius` 其实是 `defaultBuilder.build` 的别名
import { defaultBuilder } from 'memorized-moebius';

// `unshift` 可以在 `new Proxy()` 操作之前添加一些预处理，以改变这个对象的基本行为
defaultBuilder.pipeline.unshift((object) => ({}));

// `push` 可以在 `new Proxy()` 操作之后添加一些后置处理，通常用于提前存入一些属性
defaultBuilder.pipeline.push((object) => {
  object.theAnswer = 42;
  return object;
});

// 上面两个操作将会应用于这个 builder 所 build 出来的所有对象
const m = defaultBuilder.build();
console.log(typeof m.foo.bar); // 'object'
console.log(m.what.is.theAnswer); // 42
```

### 创建全新的 builder

如果不需要默认 builder 的行为，除了直接修改 `defaultBuilder.pipeline`，还可以使用导出的 `createMoebiusBuilder` 函数。

需要注意的是，一个全新创建的 builder 会缺少 `toString`、`valueOf` 等基础操作，最好先对它们进行定制，然后再使用。

```ts
import { createMoebiusBuilder } from 'memorized-moebius';
const builder = createMoebiusBuilder();

// 在这里对 `builder.pipeline` 进行定制

const m = builder.build();
```
