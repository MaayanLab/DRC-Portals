import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: (props) => <a className="link text-blue-500 hover:cursor-pointer" {...props} />,
    h1: (props) => <h1 className="prose text-4xl mb-2" {...props} />,
    h2: (props) => <h2 className="prose text-2xl mb-2" {...props} />,
    h3: (props) => <h3 className="prose text-xl my-4" {...props} />,
    h4: (props) => <h4 className="prose text-lg my-4" {...props} />,
    li: (props) => <li className="prose list-item my-2" {...props} />,
    p: (props) => <p className="prose my-2" {...props} />,
    table: (props) => <table className="my-2" {...props} />,
    td: (props) => <td className="prose p-1" {...props} />,
    th: (props) => <th className="prose" {...props} />,
    ul: (props) => <ul className="prose list-disc list-inside [&_p]:inline" {...props} />,
    ol: (props) => <ol className="prose list-decimal list-inside [&_p]:inline" {...props} />,
    code: (props) => <span className="font-mono font-semibold my-4" {...props} />,
    blockquote: (props) => <blockquote className="prose before:prose-p:content-none after:prose-p:content-none bg-white p-4 my-4 border-s-4" {...props} />,
    img: (props) => <img className="my-4" {...props} />  
  }
}
