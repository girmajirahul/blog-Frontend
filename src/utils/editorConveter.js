
/* Convert Tiptap JSON into existing TechBlog content blocks */

export function editorToBlocks(document) {
  if (!document?.content) return [];

  return document.content.map((node) => {
    switch (node.type) {
      case "paragraph":
        return {
          type: "p",
          text: nodeToText(node),
        };

      case "heading":
        return {
          type: "h2",
          text: nodeToText(node),
        };

      case "bulletList":
        return {
          type: "list",
          items: (node.content || [])
            .filter((item) => item.type === "listItem")
            .map(nodeToText)
            .filter(Boolean),
        };

      case "orderedList":
        return {
          type: "numbered",
          items: (node.content || [])
            .filter((item) => item.type === "listItem")
            .map(nodeToText)
            .filter(Boolean),
        };

      case "codeBlock":
        return {
          type: "code",
          language: node.attrs?.language || "javascript",
          code: nodeToText(node),
        };

      case "image":
        return {
          type: "image",
          src: node.attrs?.src || "",
          alt: node.attrs?.alt || "",
        };

      case "blockquote":
        return {
          type: "callout",
          tone: "info",
          text: nodeToText(node),
        };

      case "horizontalRule":
        return {
          type: "divider",
        };

      default:
        return null;
    }
  }).filter(Boolean);
}

/* Extract text from a Tiptap node, including nested list items */

function nodeToText(node) {
  if (!node) return "";

  if (node.type === "text") {
    return node.text || "";
  }

  return (node.content || [])
    .map(nodeToText)
    .join(node.type === "paragraph" ? "\n" : "");
}


/* Convert existing MongoDB blocks into Tiptap JSON */

export function blocksToEditor(blocks = []) {
  const content = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case "p":
        content.push({
          type: "paragraph",
          content: block.text
            ? [{ type: "text", text: block.text }]
            : [],
        });
        break;

      case "h2":
        content.push({
          type: "heading",
          attrs: { level: 2 },
          content: block.text
            ? [{ type: "text", text: block.text }]
            : [],
        });
        break;

      case "list":
      case "numbered": {
        const listType =
          block.type === "list" ? "bulletList" : "orderedList";

        content.push({
          type: listType,
          content: (block.items || []).map((item) => ({
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: item
                  ? [{ type: "text", text: item }]
                  : [],
              },
            ],
          })),
        });
        break;
      }

      case "code":
        content.push({
          type: "codeBlock",
          attrs: {
            language: block.language || "javascript",
          },
          content: block.code
            ? [{ type: "text", text: block.code }]
            : [],
        });
        break;

      case "image":
        content.push({
          type: "image",
          attrs: {
            src: block.src || "",
            alt: block.alt || "",
          },
        });
        break;

      case "callout":
        content.push({
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: block.text
                ? [{ type: "text", text: block.text }]
                : [],
            },
          ],
        });
        break;

      case "divider":
        content.push({ type: "horizontalRule" });
        break;

      default:
        break;
    }
  });

  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}
