import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: (props) => <a className="link text-blue-500 hover:cursor-pointer" {...props} />,
    h1: (props) => <h1 className="prose text-4xl mb-2" {...props} />,
    h2: (props) => <h2 className="prose text-2xl mb-2" {...props} />,
    h3: (props) => <h3 className="prose text-xl mb-2" {...props} />,
    h4: (props) => <h4 className="prose text-lg mb-2" {...props} />,
    li: (props) => <li className="prose list-item" {...props} />,
    p: (props) => <p className="prose my-2" {...props} />,
    table: (props) => <table className="my-2" {...props} />,
    td: (props) => <td className="prose p-1" {...props} />,
    th: (props) => <th className="prose" {...props} />,
    ul: (props) => <ul className="prose list-disc list-inside" {...props} />,
    ol: (props) => <ol className="prose list-decimal" {...props} />,
    code: (props) => <span className="font-mono" {...props} />,
    blockquote: (props) => <blockquote className="prose before:prose-p:content-none after:prose-p:content-none bg-white p-4 my-4 border-s-4" {...props} />
  }
}
