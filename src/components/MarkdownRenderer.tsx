import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 border-b-2 border-purple-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-5 first:mt-0 border-b border-purple-100 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-purple-700 mb-2 mt-4 first:mt-0 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-gray-700 mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-3 text-justify">
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 ml-4 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 leading-relaxed flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 flex-shrink-0"></span>
              <span>{children}</span>
            </li>
          ),
          
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-600">
              {children}
            </em>
          ),
          
          // Code
          code: ({ children }) => (
            <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ),
          
          // Code blocks
          pre: ({ children }) => (
            <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-200">
              {children}
            </pre>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-300 pl-4 py-2 mb-4 bg-purple-50 rounded-r-lg">
              <div className="text-gray-700 italic">
                {children}
              </div>
            </blockquote>
          ),
          
          // Links
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-purple-600 hover:text-purple-800 underline decoration-purple-300 hover:decoration-purple-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-t-2 border-purple-200" />
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-purple-50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 