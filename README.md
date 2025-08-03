# Split-Text

A JavaScript library that let's you split DOM nodes' text into lines, words, and/or chars. This allows you to create animations based on the line, word, or char.

Split-Text works with many different languages and locales.

[![npm](https://img.shields.io/npm/v/%40mattbal%2Fsplit-text)](https://www.npmjs.com/package/@mattbal/split-text)
[![License](https://img.shields.io/npm/l/%40mattbal%2Fsplit-text)](LICENSE)

## Features

- Split text by lines, words, and/or chars
- Automatically resplit text when the width of the page changes
- Split text from many different languages

## Example

**index.html**<br>

```html
<html>
  <body>
    <h1 class="split">The quick brown fox jumped over the fence</h1>
  </body>
</html>
```

**example.js**<br>

```javascript
import splitText from "@mattbal/split-text";

function example() {
  const h1 = document.querySelector(".split");
  splitText(h1, { split: { words: true }, locale: "en-US" });
}
```

**output.html**<br>
Here's the HTML that gets created by the above script.

```html
<html>
  <body>
    <h1 class="split">
      <span data-index="0" style="display: block; width: 100%;">
        <span data-index="0">The</span>
        <span data-index="1"> </span>
        <span data-index="2">quick</span>
        <span data-index="3"> </span>
        <span data-index="4">brown</span>
        <span data-index="5"> </span>
        <span data-index="6">fox</span>
        <span data-index="7"> </span>
        <span data-index="8">jumped</span>
        <span data-index="9"> </span>
        <span data-index="10">over</span>
        <span data-index="11"> </span>
        <span data-index="12">the</span>
        <span data-index="13"> </span>
        <span data-index="14">fence</span>
      </span>
    </h1>
  </body>
</html>
```

## Installation

You can install Split-Text via [npm](https://docs.npmjs.com/about-npm/).

```bash
npm install @mattbal/split-text
```

## Usage

To use Split-Text, use `document.querySelector()` or `document.querySelectorAll()` to select your node(s) you want to split the text of. Then, pass the node(s) into `splitText`.

`splitText` returns an an array of objects with `lines`, `words`, and/or `chars` properties (depending upon which options you passed into `splitText`). You can then iterate over this result and call your animation function for each object.

Note: you may want to hide the visibility of your text using CSS and then wait until the document's fonts have loaded before splitting your text and showing it, since different fonts may have different line splitting.

**JavaScript file example**
```css
.split {
  will-change: opacity, transform;
}
```

```javascript
import splitText from "@mattbal/split-text";
import { animate, stagger } from "motion";

document.fonts.ready.then(() => {
  const nodes = document.querySelectorAll(".split");
  const result = splitText(nodes, { split: { words: true }, locale: "en-US" });
  result.splitNodes.forEach((splitNode) => {
    if (splitNode.words) {
      animate(
        splitNode.words,
        { opacity: [0, 1], y: [20, 0] },
        { type: 'tween', duration: 1, delay: stagger(0.1) }
      );
    }
  });
})
```
**React example**
```css
.split {
  will-change: opacity, transform;
}
```

```jsx
import { useEffect useRef } from "react";
import { animate, stagger } from "motion/react";
import splitText, { SplitTextResult } from "@mattbal/split-text";

export default function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<SplitTextResult | null>(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      containerRef.current.style.visibility = 'visible';

      const nodes = containerRef.current.querySelectorAll('.split');
      if (nodes) {
        const result = splitText(node, {
          split: { words: true },
        });

        splitRef.current = result;

        result.splitNodes.forEach((splitNode) => {
          if (splitNode.words) {
            animate(
              splitNode.words,
              { opacity: [0, 1], y: [20, 0] },
              { type: 'tween', duration: 1, delay: stagger(0.1) }
            );
          }
        });
      }
    });

    return () => {
      splitRef.current?.stop(); // stop the Resize Observer
    };
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          visibility: "hidden",
        }}
      >
        <h1 className="text-4xl font-bold split">Hello world</h1>
      </div>
    </div>
  );
}
```

## Options

Split-Text supports the following options:

| Option                | Type                   | Default                | Description                                                                                                                                                                                                                                                                                                                                                     |
| :-------------------- | :--------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lineClass`                 | string                | undefined                   | Class to add to the wrapper element when splitting by line.   
| `wordClass`                 | string                | undefined                   | Class to add to the wrapper element when splitting by word.   
| `charClass`                 | string                | undefined                   | Class to add to the wrapper element when splitting by char.                                                                                                                                                                                                                                                                                 |                                                                                                                                                                                                                                                                               |
| `ariaLabel`            | boolean                 | true           | Whether or not to add an `aria-label` to the element passed into `splitText` with the text content of the node.                   |
| `resplit`            | boolean       | true | Whether to resplit the text when the width of the page changes.                                                                                                                                                                                                                                                                    |
| `tag`            | string       | 'span' | The type of element to wrap split text with.                                                                                                                                                        |
| `locale`            | string       | 'en' | The language and locale to split words or chars by. Split-Text uses `Intl.Segmenter` under the hood for segmenting words and characters. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter#locales for more info about your language and locale options.                                                                                                             |
| `split.lines`      | boolean                 | undefined                    | Whether to split by line.                                                                                                                                                                                   |
| `split.words`      | boolean                 | undefined                    | Whether to split by word.                                                                                                                                                                                   |
| `split.chars`      | boolean                 | undefined                    | Whether to split by char.                                                                                                                                                                                   |


## Contributing

Contributions, enhancements, and bug-fixes are welcome! [Open an issue](https://github.com/mattbal/split-text/issues) on GitHub and [submit a pull request](https://github.com/mattbal/split-text/pulls).

#### Building

To build the project locally on your computer:

1. **Clone this repo**<br>
   `git clone https://github.com/mattbal/split-text.git`

2. **Install dependencies**<br>
   `npm install`

3. **Build the code**<br>
   `npm run build`

4. **Run the tests**<br>
   `npm run test`

## License

Split-Text is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.
