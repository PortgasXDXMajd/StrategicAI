import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownParam {
  text?: string;
}
const Markdown = ({ text }: MarkdownParam) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => <p style={{ margin: '1em 0' }} {...props} />,
        ul: ({ node, ...props }) => (
          <ul style={{ paddingLeft: '20px' }} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li style={{ marginBottom: '0.5em' }} {...props} />
        ),
        h1: ({ node, ...props }) => (
          <h1 style={{ fontSize: '1.5em', margin: '1em 0' }} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 style={{ fontSize: '1.3em', margin: '1em 0' }} {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 style={{ fontSize: '1.2em', margin: '1em 0' }} {...props} />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default Markdown;
