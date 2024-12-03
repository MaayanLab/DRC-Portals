"use client"

import React, { useState } from 'react';
import { Typography, IconButton, Box, Link } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MarkdownToJSX from 'markdown-to-jsx';
import { ReactNode } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


const overrides = {
  h1: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="h1">{children}</Typography>,
    props: {
      sx: { marginBottom: 2 },
    },
  },
  h2: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="h2">{children}</Typography>,
    props: {
      sx: { marginBottom: 2 },
    },
  },
  h3: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="h3">{children}</Typography>,
    props: {
      sx: { marginBottom: 2 },
    },
  },
  h4: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="h4">{children}</Typography>,
    props: {
      sx: { marginBottom: 2 },
    },
  },
  h5: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="h5">{children}</Typography>,
    props: {
      sx: { marginBottom: 2 },
    },
  },
  p: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="body1">{children}</Typography>,
    props: {
      sx: { textAlign: "left" },
    },
  },
  span: {
    component: ({ children, ...props }: { children: ReactNode }) => <Typography {...props} variant="body1">{children}</Typography>,
    props: {
      sx: { textAlign: "left" },
    },
  },
  img: {
    component: ({ children, ...props }: { children: ReactNode }) => <div className='flex justify-center'><img {...props}>{children}</img></div>
  },
  a: {
    component: ({ children, ...props }: { children: ReactNode }) => <Link {...props} color="secondary">{children}</Link>
  },
  ul: {
    component: ({ children, ...props }: { children: ReactNode }) => <ul style={{ listStyleType: 'circle' }} {...props} color="secondary">{children}</ul>
  },
  // li: {
  //     component:  ({children, ...props}: {children: ReactNode})=><li style={{marginLeft: 20}} {...props} color="secondary">{children}</li>
  // }
  td: {
    component: ({ children, ...props }: { children: ReactNode }) => <td style={{ borderWidth: 2, borderColor: "black", minWidth: 200 }}>{children}</td>
  },
  th: {
    component: ({ children, ...props }: { children: ReactNode }) => <th style={{ borderWidth: 2, borderColor: "black", minWidth: 200 }}>{children}</th>
  },
}

const Markdown = ({ markdown }: { markdown: string }) => {
  if (!markdown) return null;
  return <MarkdownToJSX options={{ wrapper: 'article', overrides }}>{markdown}</MarkdownToJSX>
}

export const ExpandableDescription = ({
  text,
  previewLines = 5
}: {
  text: string;
  previewLines?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Box sx={{
      position: 'relative',
      py: 2,
    }}>
      <Box sx={{
        position: 'relative',
        '&::after': !isExpanded ? {
          content: '""',
          position: 'absolute',

        } : {}
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          
          <Typography> Summary
          </Typography>
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            sx={{
              color: 'text.secondary',
              padding: '4px',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            {isExpanded ? (
              <ExpandLessIcon sx={{ fontSize: 20 }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>

        <Box
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : previewLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            color: 'text.secondary'
          }}
        >
          < Markdown markdown={text} />

        </Box>

      </Box>

    </Box>
  );
};