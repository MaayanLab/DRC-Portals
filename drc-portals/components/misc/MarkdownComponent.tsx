import { Typography, Link } from '@mui/material';
import MarkdownToJSX from 'markdown-to-jsx';
import { ReactNode } from 'react';
import Image from 'next/image';

const overrides = {
    h1: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="h1">{children}</Typography>,
        props: {
            sx: { marginBottom: 2 },
        },
    },
    h2: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="h2">{children}</Typography>,
        props: {
            sx: { marginBottom: 2 },
        },
    },
    h3: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="h3">{children}</Typography>,
        props: {
            sx: { marginBottom: 2 },
        },
    },
    h4: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="h4">{children}</Typography>,
        props: {
            sx: { marginBottom: 2 },
        },
    },
    h5: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="h5">{children}</Typography>,
        props: {
            sx: { marginBottom: 2 },
        },
    },
    p: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="body1">{children}</Typography>,
        props: {
            sx: { textAlign: "left" },
        },
    },
	span: {
        component: ({children, ...props}: {children: ReactNode})=><Typography {...props} variant="body1">{children}</Typography>,
        props: {
            sx: { textAlign: "left" },
        },
    },
    img: {
        component:  ({children, ...props}: {children: ReactNode})=><div className='flex justify-center'><img {...props}>{children}</img></div>
    },
    a: {
        component:  ({children, ...props}: {children: ReactNode})=><Link {...props} color="secondary">{children}</Link>
    },
    ul: {
        component:  ({children, ...props}: {children: ReactNode})=><ul style={{listStyleType: 'circle'}} {...props} color="secondary">{children}</ul>
    },
    // li: {
    //     component:  ({children, ...props}: {children: ReactNode})=><li style={{marginLeft: 20}} {...props} color="secondary">{children}</li>
    // }
    td: {
        component:  ({children, ...props}: {children: ReactNode})=><td style={{borderWidth: 2, borderColor: "black", minWidth: 200}}>{children}</td>
    },
    th: {
        component:  ({children, ...props}: {children: ReactNode})=><th style={{borderWidth: 2, borderColor: "black", minWidth: 200}}>{children}</th>
    },
}
const Markdown = async ({src, markdown}: {src?:string, markdown?:string}) => {
    let md = null
    if (markdown) md=markdown
    if (src) md = await (await fetch(src, { next: { revalidate: 3600 } })).text()
    if (md === null) return null
    return <MarkdownToJSX options={{wrapper: 'article', overrides}}>{md}</MarkdownToJSX>
}

export default Markdown