export default function generate(program) {
    const output = []

    const gen = (node) => {
        if (node === null) return;

        switch (node.constructor.name) {
            case 'Program':
                node.statements.forEach(gen)
                break
            case 'VariableDeclaration':
                output.push(`let ${node.name} = ${gen(node.initializer)};`)
                break
            case 'FunctionDeclaration':
                const params = node.params.map(p => p.name).join(', ')
                output.push(`function ${node.name}(${params}) {`)
                gen(node.body)
                output.push(`}`)
                break
            case 'StructDeclaration':
                const fields = node.fields.map(f => f.name)
                const assignments = fields.map(f => `this.${f} = ${f};`).join(' ')
                output.push(`class ${node.name} { constructor(${fields.join(', ')}) { ${assignments} } }`)
                break
            case 'ReturnStatement':
                output.push(`return ${gen(node.expression)};`)
                break
            case 'PrintStatement':
                output.push(`console.log(${gen(node.argument)});`)
                break
            case 'IfStatement':
                output.push(`if (${gen(node.test)}) {`)
                gen(node.consequent)
                output.push(`}`)
                if (node.alternate) {
                    output.push(`else {`)
                    gen(node.alternate)
                    output.push(`}`)
                }
                break
            case 'WhileStatement':
                output.push(`while (${gen(node.test)}) {`)
                gen(node.body)
                output.push(`}`)
                break
            case 'Block':
                node.statements.forEach(gen)
                break
            case 'BreakStatement':
                output.push(`break;`)
                break
            case 'Assignment':
                output.push(`${node.target.name} = ${gen(node.source)};`)
                break
            case 'Call':
                const args = node.args.map(a => gen(a)).join(', ')
                // Struct constructors need 'new' keyword
                if (node.callee.constructor.name === 'StructDeclaration') {
                    return `new ${node.callee.name}(${args})`
                }
                return `${node.callee.name}(${args})`
            case 'BinaryExpression':
                return `(${gen(node.left)} ${node.op} ${gen(node.right)})`
            case 'UnaryExpression':
                return `(${node.op} ${gen(node.operand)})`
            case 'MemberExpression':
                return `${gen(node.object)}.${node.field}`
            case 'Variable':
                return node.name
            case 'Parameter':
                return node.name
            case 'Field':
                return node.name

            case 'Number':
                return node.toString()
            case 'String':
                return `"${node}"`
            default:
                // Handle primitive literals
                if (typeof node === 'number' || typeof node === 'boolean') return node.toString()
        }
    }

    gen(program)
    return output.join('\n')
}
