import assert = require('assert');
import htmlLooksLike = require('../src/index');

describe('html-looks-like', function () {
  it('should detect basic attribute missing', function () {
    const actual = `
      <div class="fe10c23a">
        <h1 class="aab058a7">This is a title</h1>
        <p>This is some text content</p>
      </div>
    `;

    const expected = `
      <div>
        {{ ... }}
        <p class="highlighted">This is some text content</p>
        {{ ... }}
      </div>
    `;

    try {
      htmlLooksLike(actual, expected);
    } catch (err) {
      assert.strictEqual(err.message,
        'HTML is missing the attribute `class="highlighted"` on the element\n' +
        '```html\n' +
        '<p>This is some text content</p>\n' +
        '```'
      );
    }
  });
});