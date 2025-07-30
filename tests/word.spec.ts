import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

test.describe("Split by word", () => {
  test("has 7 words", async ({ page }) => {
    await page.setContent(`
      <html>
        <body>
          <h1 style="white-space: pre-wrap;">Testing my car out</h1>
        </body>
      </html>
      `);

    const splitTextPath = path.resolve(dirname, "index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
        const h1 = document.querySelector('h1');
        splitText(h1, { split: { words: true } });
      `,
    });

    const spans = await page.locator("h1 span").all();
    const expectedWords = ["Testing", " ", "my", " ", "car", " ", "out"];
    expect(spans.length).toBe(expectedWords.length);

    for (let i = 0; i < expectedWords.length; i++) {
      await expect(spans[i]).toHaveText(expectedWords[i]);
    }
  });

  test("includes span's content", async ({ page }) => {
    await page.setContent(`
    <html>
      <body>
        <h2 style="white-space: pre-wrap;">Testing my car out
<span>Test</span></h2>
      </body>
    </html>
    `);

    const splitTextPath = path.resolve(dirname, "./index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
      const h2 = document.querySelector('h2');
      splitText(h2, { split: { words: true } });
    `,
    });

    const spans = await page.locator("h2 span").all();
    const expectedWords = ["Testing", " ", "my", " ", "car", " ", "out", "\n", "Test"];
    expect(spans.length).toBe(expectedWords.length);

    for (let i = 0; i < expectedWords.length; i++) {
      await expect(spans[i]).toHaveText(expectedWords[i]);
    }
  });
});

test.describe("Split by word and char", () => {
  test("Has chars and words", async ({ page }) => {
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
      splitText(h3, { split: { words: true, chars: true } });
    `,
    });

    const wordSpans = await page.locator("h3 > span").all();
    expect(wordSpans.length).toBe(7);

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
