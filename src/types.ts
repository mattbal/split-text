import * as z from "zod/mini";

export const optionsSchema = z.object({
  charClass: z.optional(z.string()), // class for each char
  lineClass: z.optional(z.string()), // class for each line
  wordClass: z.optional(z.string()), // class for each word
  ariaLabel: z._default(z.boolean(), true), // whether or not to add a aria label to each element
  resplit: z._default(z.boolean(), true), // whether or not to resplit the text after its width changes
  tag: z.optional(z.string()), // tag to wrap split text into
  split: z
    .object({
      chars: z.optional(z.boolean()),
      words: z.optional(z.boolean()),
      lines: z.optional(z.boolean()),
    })
    .check(
      z.refine((v) => v.chars || v.words || v.lines, {
        error: "At least one split option (chars, words, or lines) must be true",
      }),
    ),
  locale: z._default(z.string(), "en"), // locale for different splitting of words. Default 'en'. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter#parameters for locale details
});

export type Options = z.input<typeof optionsSchema>;
