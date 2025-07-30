import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

test.describe("Split by line", () => {
  test("has two lines", async ({ page }) => {
    await page.setContent(`
      <html>
        <body>
          <h1 style="white-space: pre-wrap;">Testing my car out
Newline text</h1>
        </body>
      </html>
      `);

    const splitTextPath = path.resolve(dirname, "index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
        const h1 = document.querySelector('h1');
        splitText(h1, { split: { lines: true } });
      `,
    });

    const spans = await page.locator("h1 span").all();
    expect(spans.length).toBe(2);
    expect(spans[0]).toHaveText("Testing my car out\n");
    expect(spans[0]).toHaveAttribute("data-index", "0");
    expect(spans[1]).toHaveText("Newline text");
    expect(spans[1]).toHaveAttribute("data-index", "1");
  });

  test("has two lines - 2", async ({ page }) => {
    await page.setContent(`
    <html>
      <body>
        <h2 style="white-space: pre-wrap;">Testing my car out
<span>Test</span>Newline text</h2>
      </body>
    </html>
    `);

    const splitTextPath = path.resolve(dirname, "./index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
      const h2 = document.querySelector('h2');
      splitText(h2, { split: { lines: true } });
    `,
    });

    const spans = await page.locator("h2 span").all();
    expect(spans.length).toBe(2);
    expect(spans[0]).toHaveText("Testing my car out\n");
    expect(spans[0]).toHaveAttribute("data-index", "0");
    expect(spans[1]).toHaveText("TestNewline text");
    expect(spans[1]).toHaveAttribute("data-index", "1");
  });

  test("has two lines - 3", async ({ page }) => {
    await page.setContent(`
    <html>
      <body>
        <h3 style="white-space: pre-wrap;">Test <span>different <span style="font-size: 10px; vertical-align: super;">sizes</span> are supported</span></h3>
      </body>
    </html>
    `);

    const splitTextPath = path.resolve(dirname, "./index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
      const h3 = document.querySelector('h3');
      splitText(h3, { split: { lines: true } });
    `,
    });

    const spans = await page.locator("h3 span").all();
    expect(spans.length).toBe(1);
    expect(spans[0]).toHaveText("Test different sizes are supported");
    expect(spans[0]).toHaveAttribute("data-index", "0");
  });
});

test.describe("Split by line and word", () => {
  test("Has words and lines", async ({ page }) => {
    await page.setContent(`
    <html>
      <body>
        <h3 style="white-space: pre-wrap;">The quick brown
fox</h3>
      </body>
    </html>
    `);

    const splitTextPath = path.resolve(dirname, "./index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
      const h3 = document.querySelector('h3');
      splitText(h3, { split: { lines: true, words: true } });
    `,
    });

    const lineSpans = await page.locator("h3 > span").all();
    expect(lineSpans.length).toBe(2);
    expect(lineSpans[0]).toHaveAttribute("data-index", "0");
    expect(lineSpans[1]).toHaveAttribute("data-index", "1");

    const wordSpansLine1 = await lineSpans[0].locator("span").all();
    const expectedWordsLine1 = ["The", " ", "quick", " ", "brown", "\n"];
    expect(wordSpansLine1.length).toBe(expectedWordsLine1.length);

    for (let i = 0; i < expectedWordsLine1.length; i++) {
      await expect(wordSpansLine1[i]).toHaveText(expectedWordsLine1[i]);
      await expect(wordSpansLine1[i]).toHaveAttribute("data-index", i.toString());
    }

    const wordSpansLine2 = await lineSpans[1].locator("span").all();
    const expectedWordsLine2 = ["fox"];
    expect(wordSpansLine2.length).toBe(expectedWordsLine2.length);

    for (let i = 0; i < expectedWordsLine2.length; i++) {
      await expect(wordSpansLine2[i]).toHaveText(expectedWordsLine2[i]);
      await expect(wordSpansLine2[i]).toHaveAttribute("data-index", i.toString());
    }
  });
});

test.describe("Split by line and char", () => {
  test("Has chars and lines", async ({ page }) => {
    await page.setContent(`
    <html>
      <body>
        <h3 style="white-space: pre-wrap;">The quick brown
fox</h3>
      </body>
    </html>
    `);

    const splitTextPath = path.resolve(dirname, "./index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
      const h3 = document.querySelector('h3');
      splitText(h3, { split: { lines: true, chars: true } });
    `,
    });

    const lineSpans = await page.locator("h3 > span").all();
    expect(lineSpans.length).toBe(2);

    const charSpans = await page.locator("h3 > span > span").all();
    const expectedChars = [
      "T",
      "h",
      "e",
      " ",
      "q",
      "u",
      "i",
      "c",
      "k",
      " ",
      "b",
      "r",
      "o",
      "w",
      "n",
      "\n",
      "f",
      "o",
      "x",
    ];
    expect(charSpans.length).toBe(expectedChars.length);

    for (let i = 0; i < expectedChars.length; i++) {
      await expect(charSpans[i]).toHaveText(expectedChars[i]);
    }
  });
});

test.describe("Split by line, word, and char", () => {
  test("Has chars, words, and lines", async ({ page }) => {
    await page.setContent(`
    <html>
      <body>
        <h3 style="white-space: pre-wrap;">The quick brown
fox</h3>
      </body>
    </html>
    `);

    const splitTextPath = path.resolve(dirname, "./index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
      const h3 = document.querySelector('h3');
      splitText(h3, { split: { lines: true, words: true, chars: true } });
    `,
    });

    const lineSpans = await page.locator("h3 > span").all();
    expect(lineSpans.length).toBe(2);

    const wordSpans = await page.locator("h3 > span > span").all();
    expect(wordSpans.length).toBe(7);

    const charSpans = await page.locator("h3 > span > span > span").all();
    const expectedChars = [
      "T",
      "h",
      "e",
      " ",
      "q",
      "u",
      "i",
      "c",
      "k",
      " ",
      "b",
      "r",
      "o",
      "w",
      "n",
      "\n",
      "f",
      "o",
      "x",
    ];
    expect(charSpans.length).toBe(expectedChars.length);

    for (let i = 0; i < expectedChars.length; i++) {
      await expect(charSpans[i]).toHaveText(expectedChars[i]);
    }
  });
});
