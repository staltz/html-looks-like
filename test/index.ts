// vim: set ts=2 sts=2 sw=2 :
import assert = require('assert');
import htmlLooksLike = require('../src/index');

describe('html-looks-like', function () {
  it('should match no element at end', function () {
    const actual = `
      <div>
        <span>First thing</span>
      </div>
    `;
    const expected = `
      <div>
        <span>First thing</span>
        {{ ... other things ... }}
      </div>
    `;

    assert.ok(htmlLooksLike.bool(actual, expected));
  });

  it('should match no element at beginning', function () {
    const actual = `
      <div>
        <span>Last thing</span>
      </div>
    `;
    const expected = `
      <div>
        {{ ... other things ... }}
        <span>Last thing</span>
      </div>
    `;

    assert.ok(htmlLooksLike.bool(actual, expected));
  });

  it('should match arbitrary element at end', function () {
    const actual = `
      <div>
        <span>First thing</span>
        <span>Last thing</span>
      </div>
    `;
    const expected = `
      <div>
        <span>First thing</span>
        {{ ... some things ... }}
      </div>
    `;

    htmlLooksLike(actual, expected);
    assert.ok(htmlLooksLike.bool(actual, expected));
  });

  it('should match arbitrary element at beginning', function () {
    const actual = `
      <div>
        <span>First thing</span>
        <span>Last thing</span>
      </div>
    `;
    const expected = `
      <div>
        {{ ... some things ... }}
        <span>Last thing</span>
      </div>
    `;

    htmlLooksLike(actual, expected);
    assert.ok(htmlLooksLike.bool(actual, expected));
  });

  it('should match arbitrary elements', function () {
    const actual = `
      <div>
        <span>First thing</span>
        <span>Middle thing</span>
        <span>Last thing</span>
      </div>
    `;
    const expected = `
      <div>
        {{ ... literally anything ... }}
      </div>
    `;

    htmlLooksLike(actual, expected);
  });

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
