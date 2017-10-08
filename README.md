# Color Picker

A highly intuitive, move-by-feel color picker. Instead of knobs, this uses pointer capture and the scroll wheel to make it much easier to use. When you're picking colors, you are already trying to go by feel, so why not opt for a color picker that works with you, letting you feel your way through the colors.

See [here](https://isiahmeadows.github.io/color-picker/) for a demo.

Note: this will *not* work in IE, because it is missing the pointer lock API.

## Installation

Through npm/Yarn:

```
npm install --save isiahmeadows/color-picker
yarn add git+https://github.com/isiahmeadows/color-picker
```

Or, you can copy `color-picker.js` from this repo and use it in your own little project. It injects its own CSS, so you don't have to worry about including another asset just to use this. Just note that anything namespaced under `im-color-picker` is reserved by this.

## API

```js
var elem = colorPicker(opts={
    type: "hex",
    initial: "#ff0000",
    onselect: function (hash) {
        // do things...
    },
})
```

It's pretty simple. You invoke the method, and it creates a color picker. It accepts various options (all optional), and it returns the color picker element for you to add.

Here's the options:

- `opts.type = "hex"/"rgb"/"hsv"` - Set the color type to report in `onchange` and `onselect`
    - `"hex"` returns an RGB hex string (default)
    - `"rgb"` returns an `{r, g, b}` object
    - `"hsv"` returns an `{h, s, v}` object, where `h` is in degrees
- `opts.initial = hex/rgb/hsv` - Set the initial value to a particular color
    - `var hex = "#000000"` - Use a particular RGB hex string to set the color
    - `var rgb = {r, g, b}` - Use a particular RGB value to set the color
    - `var hsv = {h, s, v}` - Use a particular HSV value to set the color
- `opts.onchange(...color)` - Called on each color change
    - Called as `opts.onchange(hex)` if `opts.type === "hex"`
    - Called as `opts.onchange(r, g, b)` if `opts.type === "rgb"`
    - Called as `opts.onchange(h, s, v)` if `opts.type === "hsv"`
- `opts.onselect(...color)` - Called on each color selection
    - Called the same way as `opts.onchange(...color)`
- `opts.onerror(ev)` - Called with any errors that occur, like not being able to capture the pointer (default is to call `console.log(ev)`)
- `opts.label = true` - Whether to show the label with instructions and the current color (default is `true`)

When you wish to remove the picker, just remove it from its parent. It holds no persistent references to anything else apart from the element and your options when it's inactive, so you don't have to worry about memory leaks.

If you need to reverse the scrolling direction (e.g. natural scrolling), fire a `color-picker.scroll-natural` or `color-picker.scroll-normal` event to change that setting. For example: `elem.dispatchEvent(new Event("color-picker.scroll-natural"))`.

## License

The following license (ISC License):

Copyright (c) 2017 and later, Isiah Meadows <me@isiahmeadows.com> and others.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
