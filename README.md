# `html-looks-like`

#### Assert that an HTML string looks approximately the same as another HTML

**Install:** `npm install html-looks-like`

**Example:**

```js
const htmlLooksLike = require('html-looks-like');

const actual = `
  <div class="fe10c23a">
    <h1 class="aab058a7">This is a title</h1>
    <p>This is some text content</p>
  </div>
`;

// I just want to know if there is a highlighted <p> inside a <div>
const expected = `
  <div>
    {{ ... }}
    <p class="highlighted">This is some text content</p>
    {{ ... }}
  </div>
`;

htmlLooksLike(actual, expected);
```

```
Error: HTML is missing the attribute `class="highlighted"` on the element
``html
<p>This is some text content</p>
``
```

## How this works

This library does much more than assert that the string `actual === expected`. To start with, it ignores differences in whitespaces in the two strings, but most importantly, it uses `expected` as a template and checks if `actual` matches the shape.

`htmlLooksLike(actual, expected)` will check whether the HTML string `actual` has **at least** everything that is specified in the HTML string `expected`. It is certainly valid that `actual` is much larger and more specific than `expected`, and for expressing those situations, we use *placeholders*.

The placeholder syntax is `{{ }}` and it stands for "some stuff here, either nothing or many elements". Inside the brackets you can write whatever you want, it doesn't get processed, it is just a comment. By including or omitting placeholders we can control what is the HTML shape we expect. Notice the difference between the following examples:

```js
// This means "we expect a <div> with children, where somewhere in the middle
// there is a <p> as a child".
const expected = `
  <div>
    {{ more stuff before the paragraph }}
    <p class="highlighted">This is some text content</p>
    {{ more stuff after the paragraph }}
  </div>
`;
```

```js
// This means "we expect a <div> with children,
// where THE FIRST child MUST be <p>".
const expected = `
  <div>
    <p class="highlighted">This is some text content</p>
    {{ more stuff after the paragraph }}
  </div>
`;
```

```js
// This means "we expect a <div> with only one child, which is <p>".
const expected = `
  <div>
    <p class="highlighted">This is some text content</p>
  </div>
`;
```

## API

#### `function htmlLooksLike(actual: string, expected: string): void`

Tests if `actual` as an HTML string fits the template described in `expected`. If it matches, this function returns nothing (undefined), and no other effect happens. If it does not match, an error is thrown describing the mismatch.

#### `htmlLooksLike.bool = function(actual: string, expected: string): boolean`

If you want a simple boolean to indicate the match result, call `htmlLooksLike.bool(actual, expected)`. No error is thrown in case of a mismatch.

## License

MIT

## Thanks

This library uses these dependencies. Thanks to their respective authors:

- `diff-dom`
- `domwalk`
- `jsdom`
- `lodash`
