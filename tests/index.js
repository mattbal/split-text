/*
    Note: you have to manually copy over dist/index.js to this folder and remove ESM imports.
    Playwright does not support ESM imports currently, so we need to manually copy over.

    Keep the const options = { ... } code in this file in place of the options parsing with zod (since we can't use ESM imports)
*/

const metaMap = new WeakMap();
/**
 * Split node(s)'s text into chars, words, or lines
 * @param target - The target node(s)
 * @param rawOptions - Raw options for configuring split-text
 */
function splitText(target, rawOptions) {
    const options = {
        locale: 'en',
        ariaLabel: true,
        resplit: true,
        ...rawOptions,
    }
    const elements = target instanceof Element ? [target] : Array.from(target);
    return elements
        .map((el) => {
            if (!(el instanceof HTMLElement))
                return null;
            if (!metaMap.has(el)) {
                const observer = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        const width = entry.contentRect.width;
                        const metadata = metaMap.get(el);
                        if (!metadata)
                            return;
                        if (width !== metadata.lastWidth && options.resplit) {
                            metadata.lastWidth = width;
                            split(el, options, metadata);
                        }
                    }
                });
                metaMap.set(el, {
                    originalHTML: el.innerHTML,
                    lastWidth: el.getBoundingClientRect().width,
                    observer,
                });
                observer.observe(el);
            }
            const metadata = metaMap.get(el);
            return split(el, options, metadata);
        })
        .filter((splitNode) => splitNode !== null);
}
/**
 * Split an element
 * @param el - element
 * @param opts - options
 * @param metadata - metadata
 */
function split(el, opts, metadata) {
    if (!el.childNodes)
        return null;
    // reset to original
    el.innerHTML = metadata.originalHTML;
    if (!el.textContent)
        return null;
    const nodesToBeAdded = [];
    if (opts.split.lines) {
        const textRectsTree = getTextRectsTree(el);
        splitByLine(textRectsTree, nodesToBeAdded, opts.tag, opts.lineClass);
    }
    if (opts.split.words) {
        const wordSegmenter = new Intl.Segmenter(opts.locale, { granularity: "word" });
        if (opts.split.lines) {
            splitBySegment(nodesToBeAdded, wordSegmenter, opts.tag, opts.wordClass);
        }
        else {
            const text = el.textContent;
            const words = wordSegmenter.segment(text);
            Array.from(words).forEach(({ segment }, index) => {
                nodesToBeAdded.push(createWrapper(segment, index, opts.tag, opts.wordClass));
            });
        }
    }
    if (opts.split.chars) {
        const charSegmenter = new Intl.Segmenter(opts.locale, { granularity: "grapheme" });
        if (opts.split.lines) {
            if (opts.split.words) {
                splitBySegment(nodesToBeAdded, charSegmenter, opts.tag, opts.charClass, true);
            }
            else {
                splitBySegment(nodesToBeAdded, charSegmenter, opts.tag, opts.charClass);
            }
        }
        else {
            if (opts.split.words) {
                splitBySegment(nodesToBeAdded, charSegmenter, opts.tag, opts.charClass);
            }
            else {
                const text = el.textContent;
                const chars = charSegmenter.segment(text);
                Array.from(chars).forEach(({ segment }, index) => {
                    nodesToBeAdded.push(createWrapper(segment, index, opts.tag, opts.charClass));
                });
            }
        }
    }
    const frag = document.createDocumentFragment();
    nodesToBeAdded.forEach((node) => frag.appendChild(node));
    el.replaceChildren(frag);
    if (opts.ariaLabel) {
        el.setAttribute("aria-label", el.textContent);
    }
    const splitNode = {};
    if (opts.split.lines) {
        splitNode.lines = Array.from(el.children);
        if (opts.split.words) {
            splitNode.words = splitNode.lines.flatMap((node) => Array.from(node.children));
            if (opts.split.chars) {
                splitNode.chars = splitNode.words.flatMap((node) => Array.from(node.children));
            }
        }
        else {
            if (opts.split.chars) {
                splitNode.chars = splitNode.lines.flatMap((node) => Array.from(node.children));
            }
        }
    }
    else {
        if (opts.split.words) {
            splitNode.words = Array.from(el.children);
            if (opts.split.chars) {
                splitNode.chars = splitNode.words.flatMap((node) => Array.from(node.children));
            }
        }
        else {
            if (opts.split.chars) {
                splitNode.words = Array.from(el.children);
            }
        }
    }
    return splitNode;
}
/**
 * Get the tree with TextRects in Text Nodes.
 * @param node - Node
 * @returns - HTML Element tree with Text Nodes that include TextRects
 */
function getTextRectsTree(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        return {
            node,
            children: Array.from(node.childNodes).map((childNode) => getTextRectsTree(childNode)),
        };
    }
    if (node.nodeType === Node.ATTRIBUTE_NODE) {
        return node;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent)
            return null;
        const range = document.createRange();
        const text = node.textContent;
        const fragments = [];
        // For each character, record its rect
        for (let i = 0; i < text.length; i++) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const [rect] = range.getClientRects();
            fragments.push({ index: i, rect });
        }
        // Bucket rects by rounded top value
        const linesMap = new Map();
        fragments.forEach((frag) => {
            const lineKey = Math.round(frag.rect.top / 5) * 5; // bucket by 5px groups
            const line = linesMap.get(lineKey);
            if (line) {
                line.push(frag);
            }
            else {
                linesMap.set(lineKey, [frag]);
            }
        });
        // For each line bucket, sort by left and get the start and end positions
        const lineKeys = Array.from(linesMap.keys()).sort((a, b) => a - b);
        return {
            node,
            textRects: lineKeys.map((key) => {
                const frags = linesMap.get(key).sort((a, b) => a.rect.left - b.rect.left);
                return { start: frags[0].index, end: frags[frags.length - 1].index, top: key };
            }),
        };
    }
    // if not a HTMLElement, Attribute Node, or Text Node
    return null;
}
/**
 * Create a new wrapper element
 * @param text - text for element
 * @param index - index
 * @param tag - tag for element
 * @param className - optional classname to be applied
 * @returns - new element
 */
function createWrapper(text, index, tag = "span", className) {
    const el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    el.setAttribute("data-index", index.toString());
    el.appendChild(document.createTextNode(text));
    return el;
}
/**
 * Helper function
 * @param buffer - temporary holder for nodes of the same line
 * @param lines - nodes to replace the root element's children
 * @param tag - tag for wrapper element
 * @param className - optional classname for each line's span
 */
function clearBuffer(buffer, lines, tag, className) {
    let text = "";
    for (let i = 0; i < buffer.length; i++) {
        text += buffer[i].node.textContent.slice(buffer[i].start, buffer[i].end + 1);
    }
    const index = lines.length;
    const newSpan = createWrapper(text, index, tag, className);
    newSpan.style.display = "inline-block";
    lines.push(newSpan);
    buffer.length = 0; // clear array
}
/**
 * Split the tree into lines
 * @param root - root element with textRects types
 * @param lines - nodes to eventually replace the root element's children
 * @param tag - tag for wrapper element
 * @param className - optional classname for each line's span
 */
function splitByLine(root, lines, tag, className) {
    const buffer = [];
    root.children.forEach((childNode) => splitByLineRecursive(childNode, buffer, lines, tag, className));
    if (buffer.length !== 0) {
        clearBuffer(buffer, lines, tag, className);
    }
}
/**
 * Recursive helper function
 * @param node - node
 * @param buffer - temporary holder for nodes of the same line
 * @param lines - nodes to eventually replace the root element's children
 * @param tag - tag for wrapper element
 * @param className - optional classname for each line's span
 */
function splitByLineRecursive(node, buffer, lines, tag, className) {
    // if not null
    if (node) {
        if ("children" in node) {
            node.children.forEach((childNode) => splitByLineRecursive(childNode, buffer, lines, tag, className));
        }
        else if ("textRects" in node) {
            node.textRects.forEach(({ start, end, top }) => {
                const lastEl = buffer[buffer.length - 1];
                if (lastEl && lastEl.top !== top) {
                    clearBuffer(buffer, lines, tag, className);
                }
                buffer.push({ start, end, top, node: node.node });
            });
        }
    }
}
/**
 * Helper function
 * @param nodes - nodes to eventually replace the root element's children
 * @param segmenter - Intl.Segmenter
 * @param tag - tag for wrapper element
 * @param className - optional classname for each span to be created
 * @param depth - optional depth for nodes that need double looping
 */
function splitBySegment(nodes, segmenter, tag, className, depth) {
    const processNode = (node) => {
        const text = node.textContent;
        const segments = Array.from(segmenter.segment(text));
        const newNodes = segments.map(({ segment }, index) => {
            const newNode = createWrapper(segment, index, tag, className);
            newNode.style.display = "inline-block";
            return newNode;
        });
        node.replaceChildren(...newNodes);
    };
    nodes.forEach((child) => {
        if (depth) {
            Array.from(child.children).forEach((grandchild) => {
                processNode(grandchild);
            });
        }
        else {
            processNode(child);
        }
    });
}