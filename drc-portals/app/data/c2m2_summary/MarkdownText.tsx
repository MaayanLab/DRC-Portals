import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';

// Define props for custom elements using React.HTMLAttributes for intrinsic elements (p, strong, etc.)
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type StrongProps = React.HTMLAttributes<HTMLElement>;

interface MarkdownTextProps {
  children: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ children }) => (
  <ReactMarkdown
    components={{
      p: (props: ParagraphProps) => (
        <Typography variant="body1" sx={{ mb: 1 }} {...props} />
      ),
      strong: (props: StrongProps) => (
        <Typography component="span" fontWeight="bold" {...props} />
      ),
      // Add more custom components here by typing accordingly
    }}
  >
    {children}
  </ReactMarkdown>
);

export default MarkdownText;
