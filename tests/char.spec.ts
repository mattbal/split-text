import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

test.describe("Split by char", () => {
  test("has chars", async ({ page }) => {
    await page.setContent(`
      <html>
        <body>
          <h1 style="white-space: pre-wrap;">Testing my car</h1>
        </body>
      </html>
      `);

    const splitTextPath = path.resolve(dirname, "index.js");
    await page.addScriptTag({ path: splitTextPath });
    await page.addScriptTag({
      content: `
        const h1 = document.querySelector('h1');
        splitText(h1, { split: { chars: true } });
      `,
    });

    const spans = await page.locator("h1 > span").all();
    const expectedChars = ["T", "e", "s", "t", "i", "n", "g", " ", "m", "y", " ", "c", "a", "r"];
    expect(spans.length).toBe(expectedChars.length);

    for (let i = 0; i < expectedChars.length; i++) {
      await expect(spans[i]).toHaveText(expectedChars[i]);
      await expect(spans[i]).toHaveAttribute("data-index", i.toString());
    }
  });
});
