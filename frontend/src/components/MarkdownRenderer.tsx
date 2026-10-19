import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Clean, lightweight, and responsive Markdown renderer for IP SHAKTI SAHAYAK structured legal outputs.
 * Parses headers, tables, lists, blockquotes, code spans, and bold/italic text.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Helper to render inline formatting: **bold**, *italic*, `code`
  const renderInline = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline Code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        elements.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded bg-emerald-50/80 text-emerald-900 border border-emerald-200 font-mono text-[11px] font-semibold mx-0.5"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        elements.push(
          <strong key={keyIdx++} className="font-bold text-slate-950">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        elements.push(
          <em key={keyIdx++} className="italic text-slate-800">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Plain text up to the next formatting token
      const nextSpecial = remaining.search(/[`*]/);
      if (nextSpecial === -1) {
        elements.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      } else if (nextSpecial === 0) {
        // Stray character not forming a valid pair
        elements.push(<span key={keyIdx++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      } else {
        elements.push(<span key={keyIdx++}>{remaining.slice(0, nextSpecial)}</span>);
        remaining = remaining.slice(nextSpecial);
      }
    }

    return elements;
  };

  // Split content into blocks: tables, headers, lists, quotes, paragraphs
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const rawLine = lines[lineIdx];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      lineIdx++;
      continue;
    }

    // 2. Horizontal Rule: --- or ***
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${lineIdx}`} className="my-3.5 border-slate-200" />);
      lineIdx++;
      continue;
    }

    // 3. Markdown Table: starts with | and contains |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('|') && lines[lineIdx].trim().endsWith('|')) {
        tableLines.push(lines[lineIdx].trim());
        lineIdx++;
      }

      if (tableLines.length >= 2) {
        const headerCols = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
        // Check if line 1 is a separator like |---|---|
        const isSep = /^\|(?:\s*:?-+:?\s*\|)+$/.test(tableLines[1]);
        const bodyLines = isSep ? tableLines.slice(2) : tableLines.slice(1);

        blocks.push(
          <div key={`table-${lineIdx}`} className="my-3.5 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  {headerCols.map((col, cIdx) => (
                    <th key={cIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bodyLines.map((bLine, rIdx) => {
                  const cells = bLine.split('|').slice(1, -1).map(c => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-emerald-50/30 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-slate-700 text-xs leading-relaxed">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Headers: #, ##, ###, ####
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      blocks.push(
        <h2 key={`h1-${lineIdx}`} className="font-heading font-extrabold text-base sm:text-lg text-slate-900 mt-4 mb-2">
          {renderInline(h1Match[1])}
        </h2>
      );
      lineIdx++;
      continue;
    }

    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      blocks.push(
        <h3 key={`h2-${lineIdx}`} className="font-heading font-bold text-sm sm:text-base text-slate-900 mt-3.5 mb-1.5 flex items-center gap-1.5">
          {renderInline(h2Match[1])}
        </h3>
      );
      lineIdx++;
      continue;
    }

    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      const headerTitle = h3Match[1];
      const lower = headerTitle.toLowerCase();
      const isShortAnswer = lower.includes('short answer') || lower.includes('direct answer');
      const isEvidence = lower.includes('evidence');
      const isNextStep = lower.includes('next step') || lower.includes('recommend');
      const isCheck = lower.includes('check');
      const isWhy = lower.includes('why');

      let icon = '📌';
      let badgeClass = 'text-slate-900';
      if (isShortAnswer) {
        icon = '⚡';
        badgeClass = 'text-emerald-950 font-bold';
      } else if (isWhy) {
        icon = '⚖️';
        badgeClass = 'text-slate-900';
      } else if (isCheck) {
        icon = '🔍';
        badgeClass = 'text-slate-900';
      } else if (isNextStep) {
        icon = '🚀';
        badgeClass = 'text-emerald-900 font-bold';
      } else if (isEvidence) {
        icon = '📚';
        badgeClass = 'text-indigo-950 font-bold';
      }

      blocks.push(
        <div
          key={`h3-${lineIdx}`}
          className={`font-heading font-bold text-xs sm:text-sm mt-3.5 mb-1.5 flex items-center gap-1.5 ${badgeClass}`}
        >
          <span>{icon}</span>
          <span>{renderInline(headerTitle)}</span>
        </div>
      );
      lineIdx++;
      continue;
    }

    // 5. Blockquotes: > quote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('>')) {
        quoteLines.push(lines[lineIdx].trim().replace(/^>\s*/, ''));
        lineIdx++;
      }
      blocks.push(
        <blockquote
          key={`quote-${lineIdx}`}
          className="my-3 pl-3.5 py-1.5 border-l-3 border-emerald-500 bg-emerald-50/50 rounded-r-xl text-xs text-slate-700 italic leading-relaxed"
        >
          {quoteLines.map((q, qIdx) => (
            <p key={qIdx}>{renderInline(q)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 6. Unordered List Items: - or *
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (lineIdx < lines.length && /^[-*]\s+/.test(lines[lineIdx].trim())) {
        listItems.push(lines[lineIdx].trim().replace(/^[-*]\s+/, ''));
        lineIdx++;
      }
      blocks.push(
        <ul key={`ul-${lineIdx}`} className="my-2 space-y-1.5 text-xs text-slate-700">
          {listItems.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Ordered List Items: 1. , 2. 
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (lineIdx < lines.length && /^\d+\.\s+/.test(lines[lineIdx].trim())) {
        listItems.push(lines[lineIdx].trim().replace(/^\d+\.\s+/, ''));
        lineIdx++;
      }
      blocks.push(
        <ol key={`ol-${lineIdx}`} className="my-2 space-y-1.5 text-xs text-slate-700">
          {listItems.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2 leading-relaxed">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {iIdx + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Normal Paragraph
    blocks.push(
      <p key={`p-${lineIdx}`} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-1.5">
        {renderInline(trimmed)}
      </p>
    );
    lineIdx++;
  }

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
};
