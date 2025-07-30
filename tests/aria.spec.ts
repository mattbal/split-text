import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

test.describe("Aria", () => {
  test("Adds aria label", async ({ page }) => {
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
        splitText(h1, { split: { lines: true }, ariaLabel: true });
      `,
    });

    const h1 = await page.locator("h1").all();
    expect(h1[0]).toHaveAttribute("aria-label", "Testing my car out");
  });
});
