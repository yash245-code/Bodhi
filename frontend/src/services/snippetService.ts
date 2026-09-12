import * as monaco from 'monaco-editor'

let isSnippetsRegistered = false

export function registerLanguageSnippets(): void {
  if (isSnippetsRegistered) return
  isSnippetsRegistered = true

  // ----------------------------------------------------
  // 1. HTML Snippets
  // ----------------------------------------------------
  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['<', '!', 'h', 'd', 'p', 'a', 'b', 'i', 'f', 's', 't'],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const textBefore = lineContent.substring(0, position.column - 1)
      const word = model.getWordUntilPosition(position)
      
      const hasLeadingBracket = textBefore.endsWith('<' + word.word) || textBefore.trim().endsWith('<')
      const startCol = hasLeadingBracket
        ? Math.max(1, position.column - word.word.length - 1)
        : word.startColumn

      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: startCol,
        endColumn: position.column
      }

      const createTagSnippet = (
        tag: string,
        label: string,
        doc: string,
        inner: string = '${1}',
        attrs: string = ''
      ): monaco.languages.CompletionItem => ({
        label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: doc,
        detail: `HTML Tag: <${tag}>`,
        insertText: `<${tag}${attrs ? ' ' + attrs : ''}>${inner}</${tag}>`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range
      })

      const htmlSnippets: monaco.languages.CompletionItem[] = [
        {
          label: 'html:5',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'HTML5 Boilerplate Structure',
          detail: 'HTML5 Starter Template',
          insertText: [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>${1:Document}</title>',
            '</head>',
            '<body>',
            '  ${0}',
            '</body>',
            '</html>'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: '!',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Quick HTML5 Starter Template',
          detail: 'HTML5 Template',
          insertText: [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>${1:Document}</title>',
            '</head>',
            '<body>',
            '  ${0}',
            '</body>',
            '</html>'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        createTagSnippet('h1', 'h1', 'Heading 1', '${1:Heading 1}'),
        createTagSnippet('h2', 'h2', 'Heading 2', '${1:Heading 2}'),
        createTagSnippet('h3', 'h3', 'Heading 3', '${1:Heading 3}'),
        createTagSnippet('h4', 'h4', 'Heading 4', '${1:Heading 4}'),
        createTagSnippet('h5', 'h5', 'Heading 5', '${1:Heading 5}'),
        createTagSnippet('h6', 'h6', 'Heading 6', '${1:Heading 6}'),
        createTagSnippet('p', 'p', 'Paragraph', '${1:Text}'),
        createTagSnippet('div', 'div', 'Division container', '\n  ${1}\n'),
        createTagSnippet('div.class', 'div.class', 'Div with class', '\n  ${2}\n', 'class="${1:container}"'),
        createTagSnippet('span', 'span', 'Inline span', '${1}'),
        createTagSnippet('a', 'a', 'Hyperlink anchor', '${2:Link Text}', 'href="${1:#}"'),
        createTagSnippet('button', 'button', 'Button element', '${2:Click Me}', 'type="${1:button}"'),
        createTagSnippet('input', 'input', 'Input field', '', 'type="${1:text}" name="${2:name}" placeholder="${3:placeholder}" />'),
        createTagSnippet('form', 'form', 'Form container', '\n  ${2}\n', 'action="${1:#}" method="POST"'),
        createTagSnippet('ul', 'ul', 'Unordered List', '\n  <li>${1:Item}</li>\n'),
        createTagSnippet('ol', 'ol', 'Ordered List', '\n  <li>${1:Item}</li>\n'),
        createTagSnippet('li', 'li', 'List item', '${1:Item}'),
        createTagSnippet('table', 'table', 'Table structure', '\n  <thead>\n    <tr>\n      <th>${1:Header}</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>${2:Data}</td>\n    </tr>\n  </tbody>\n'),
        createTagSnippet('script', 'script', 'JavaScript script tag', '\n  ${1}\n'),
        createTagSnippet('script:src', 'script:src', 'External script tag', '', 'src="${1:script.js}"></script'),
        createTagSnippet('style', 'style', 'CSS style block', '\n  ${1}\n'),
        createTagSnippet('link:css', 'link:css', 'Link CSS stylesheet', '', 'rel="stylesheet" href="${1:style.css}" />'),
        createTagSnippet('img', 'img', 'Image element', '', 'src="${1:image.png}" alt="${2:description}" />'),
        createTagSnippet('section', 'section', 'Section block', '\n  ${1}\n'),
        createTagSnippet('header', 'header', 'Header element', '\n  ${1}\n'),
        createTagSnippet('footer', 'footer', 'Footer element', '\n  ${1}\n'),
        createTagSnippet('nav', 'nav', 'Navigation container', '\n  ${1}\n'),
        createTagSnippet('main', 'main', 'Main content container', '\n  ${1}\n')
      ]

      return { suggestions: htmlSnippets }
    }
  })

  // ----------------------------------------------------
  // 2. JavaScript & TypeScript Snippets (JS, TS, JSX, TSX)
  // ----------------------------------------------------
  const registerJsTsSnippets = (lang: string): void => {
    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const jsSnippets: monaco.languages.CompletionItem[] = [
          {
            label: 'clg',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'console.log() statement',
            detail: 'console.log(value)',
            insertText: 'console.log(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'console.log() statement',
            detail: 'console.log(value)',
            insertText: 'console.log(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'fn',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Function declaration',
            detail: 'function name(params) { ... }',
            insertText: [
              'function ${1:name}(${2:params}) {',
              '  ${0}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'afn',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Arrow function expression',
            detail: 'const name = (params) => { ... }',
            insertText: [
              'const ${1:name} = (${2:params}) => {',
              '  ${0}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'rfc',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'React Functional Component',
            detail: 'export const Component: React.FC = () => ...',
            insertText: [
              "import React from 'react'",
              '',
              'interface ${1:ComponentName}Props {',
              '  ${2}',
              '}',
              '',
              'export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = () => {',
              '  return (',
              '    <div>',
              '      ${0:${1:ComponentName}}',
              '    </div>',
              '  )',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'useState',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'React useState Hook',
            detail: 'const [state, setState] = useState(initial)',
            insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialState})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'useEffect',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'React useEffect Hook',
            detail: 'useEffect(() => { ... }, [deps])',
            insertText: [
              'useEffect(() => {',
              '  ${1}',
              '  return () => {',
              '    ${2}',
              '  }',
              '}, [${3:deps}])'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'useMemo',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'React useMemo Hook',
            detail: 'const memoized = useMemo(() => value, [deps])',
            insertText: [
              'const ${1:memoizedValue} = useMemo(() => {',
              '  return ${2:computeValue}',
              '}, [${3:deps}])'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'useCallback',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'React useCallback Hook',
            detail: 'const callback = useCallback(() => { ... }, [deps])',
            insertText: [
              'const ${1:callback} = useCallback((${2:params}) => {',
              '  ${3}',
              '}, [${4:deps}])'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'useRef',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'React useRef Hook',
            detail: 'const ref = useRef(initial)',
            insertText: 'const ${1:ref} = useRef<${2:HTMLDivElement | null}>(${3:null})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'imp',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Import statement',
            detail: "import { ... } from '...'",
            insertText: "import { ${2:items} } from '${1:module}'",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'trycatch',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Try / Catch block',
            detail: 'try { ... } catch (err) { ... }',
            insertText: [
              'try {',
              '  ${1}',
              '} catch (error) {',
              '  console.error(${2:error})',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'forof',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'for...of loop',
            detail: 'for (const item of items) { ... }',
            insertText: [
              'for (const ${1:item} of ${2:items}) {',
              '  ${0}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'prom',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'new Promise',
            detail: 'return new Promise((resolve, reject) => { ... })',
            insertText: [
              'return new Promise((resolve, reject) => {',
              '  ${0}',
              '})'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: 'asyncfn',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Async function declaration',
            detail: 'async function name(params) { ... }',
            insertText: [
              'async function ${1:name}(${2:params}): Promise<${3:void}> {',
              '  ${0}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          }
        ]

        return { suggestions: jsSnippets }
      }
    })
  }

  registerJsTsSnippets('javascript')
  registerJsTsSnippets('typescript')

  // ----------------------------------------------------
  // 3. Python Snippets
  // ----------------------------------------------------
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const pySnippets: monaco.languages.CompletionItem[] = [
        {
          label: 'main',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'if __name__ == "__main__": boilerplate',
          detail: 'Python Main Entrypoint',
          insertText: [
            'def main():',
            '    ${1:pass}',
            '',
            'if __name__ == "__main__":',
            '    main()'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'def',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Function definition',
          detail: 'def function_name(args): ...',
          insertText: [
            'def ${1:func_name}(${2:args}):',
            '    """${3:Docstring}"""',
            '    ${0:pass}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'class',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Class definition with __init__',
          detail: 'class ClassName: ...',
          insertText: [
            'class ${1:ClassName}:',
            '    def __init__(self, ${2:args}):',
            '        ${0:pass}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'try',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'try / except block',
          detail: 'try: ... except Exception as e: ...',
          insertText: [
            'try:',
            '    ${1:pass}',
            'except ${2:Exception} as ${3:e}:',
            '    ${0:print(f"Error: {e}")}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'with',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'with open() context manager',
          detail: 'with open(filename, mode) as f: ...',
          insertText: [
            'with open("${1:file.txt}", "${2:r}") as ${3:f}:',
            '    ${0:content = f.read()}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        }
      ]

      return { suggestions: pySnippets }
    }
  })

  // ----------------------------------------------------
  // 4. CSS Snippets
  // ----------------------------------------------------
  monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const cssSnippets: monaco.languages.CompletionItem[] = [
        {
          label: 'flexcenter',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Center items with Flexbox',
          detail: 'display: flex; justify-content: center; align-items: center;',
          insertText: [
            'display: flex;',
            'justify-content: center;',
            'align-items: center;'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'reset',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'CSS Box-Sizing Reset',
          detail: '* { box-sizing: border-box; margin: 0; padding: 0; }',
          insertText: [
            '*, *::before, *::after {',
            '  box-sizing: border-box;',
            '  margin: 0;',
            '  padding: 0;',
            '}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'gridcenter',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Center items with CSS Grid',
          detail: 'display: grid; place-items: center;',
          insertText: [
            'display: grid;',
            'place-items: center;'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        }
      ]

      return { suggestions: cssSnippets }
    }
  })
}
