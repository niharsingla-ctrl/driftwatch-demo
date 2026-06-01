import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "import",
  "export",
  "const",
  "let",
  "var",
  "async",
  "await",
  "function",
  "return",
  "from",
  "default",
  "new",
  "if",
  "else",
  "for",
  "while",
  "true",
  "false",
  "null",
  "undefined",
]);

// comment | string (single/double/template) | identifier-word | number
const TOKEN_RE =
  /(\/\/[^\n]*)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|([A-Za-z_$][\w$]*)|(\d+(?:\.\d+)?)/g;

/** Naive but readable JS/TS highlighter: strings green, keywords blue, comments amber. */
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of code.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(<Fragment key={key++}>{code.slice(last, idx)}</Fragment>);
    const [tok, comment, str, word, num] = m;
    if (comment) {
      out.push(
        <span key={key++} className="text-warning/80">
          {comment}
        </span>
      );
    } else if (str) {
      out.push(
        <span key={key++} className="text-success">
          {str}
        </span>
      );
    } else if (word && KEYWORDS.has(word)) {
      out.push(
        <span key={key++} className="text-accent">
          {word}
        </span>
      );
    } else if (num) {
      out.push(
        <span key={key++} className="text-[#d2a8ff]">
          {num}
        </span>
      );
    } else {
      out.push(<Fragment key={key++}>{tok}</Fragment>);
    }
    last = idx + tok.length;
  }
  if (last < code.length)
    out.push(<Fragment key={key++}>{code.slice(last)}</Fragment>);
  return out;
}

export function CodeBlock({
  code,
  className,
  lineNumbers = true,
}: {
  code: string;
  className?: string;
  lineNumbers?: boolean;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div
      className={cn(
        "overflow-auto bg-[#0b0f15] mono text-2xs leading-[1.65]",
        className
      )}
    >
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="align-top">
              {lineNumbers && (
                <td className="select-none whitespace-nowrap border-r border-border/60 px-3 text-right text-border">
                  {i + 1}
                </td>
              )}
              <td className="w-full whitespace-pre px-3 text-text-primary">
                {line ? highlight(line) : " "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
