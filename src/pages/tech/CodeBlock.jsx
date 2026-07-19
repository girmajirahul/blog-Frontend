import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

// interface CodeBlockProps {
//   code: string;
//   language: string;
//   filename?: string;
// }

const CodeBlock = ({
  code,
  language,
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>

          <span className="ml-2 font-mono text-gray-600">
            {filename || language}
          </span>

          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-700">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: "1.1rem 1.25rem",
          background: "transparent",
          fontSize: "0.9rem",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          },
        }}
        lineNumberStyle={{
          minWidth: "2.25em",
          paddingRight: "1em",
          color: "#9CA3AF",
          userSelect: "none",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;