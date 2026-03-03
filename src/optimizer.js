import * as core from './core.js'

export default function optimize(node) {
    return optimizeNode(node)
}

function optimizeNode(node) {
    if (node === null || node === undefined) return node
    if (typeof node === 'number' || typeof node === 'boolean' || typeof node === 'string') return node

    switch (node.constructor.name) {
        case 'Program':
            node.statements = node.statements.map(optimizeNode)
            return node

        case 'FunctionDeclaration':
            node.params = node.params.map(optimizeNode)
            node.body = optimizeNode(node.body)
            return node

        case 'StructDeclaration':
            node.fields = node.fields.map(optimizeNode)
            return node

        case 'VariableDeclaration':
            node.initializer = optimizeNode(node.initializer)
            return node

        case 'Block':
            node.statements = node.statements.map(optimizeNode)
            return node

        case 'IfStatement':
            node.test = optimizeNode(node.test)
            node.consequent = optimizeNode(node.consequent)
            node.alternate = optimizeNode(node.alternate)
            return node

        case 'WhileStatement':
            node.test = optimizeNode(node.test)
            node.body = optimizeNode(node.body)
            return node

        case 'ReturnStatement':
            node.expression = optimizeNode(node.expression)
            return node

        case 'PrintStatement':
            node.argument = optimizeNode(node.argument)
            return node

        case 'Assignment':
            node.source = optimizeNode(node.source)
            return node

        case 'Call':
            node.args = node.args.map(optimizeNode)
            return node

        case 'BinaryExpression': {
            const left = optimizeNode(node.left)
            const right = optimizeNode(node.right)
            // Constant folding: both operands are numeric literals
            if (typeof left === 'number' && typeof right === 'number') {
                switch (node.op) {
                    case '+': return left + right
                    case '-': return left - right
                    case '*': return left * right
                    case '/': return Math.trunc(left / right)
                    case '%': return left % right
                    case '<': return left < right
                    case '<=': return left <= right
                    case '>': return left > right
                    case '>=': return left >= right
                    case '==': return left === right
                    case '!=': return left !== right
                }
            }
            // Constant folding: both operands are boolean literals
            if (typeof left === 'boolean' && typeof right === 'boolean') {
                switch (node.op) {
                    case '&&': return left && right
                    case '||': return left || right
                    case '==': return left === right
                    case '!=': return left !== right
                }
            }
            node.left = left
            node.right = right
            return node
        }

        case 'UnaryExpression': {
            const operand = optimizeNode(node.operand)
            if (node.op === '-' && typeof operand === 'number') return -operand
            if (node.op === '!' && typeof operand === 'boolean') return !operand
            node.operand = operand
            return node
        }

        case 'MemberExpression':
            node.object = optimizeNode(node.object)
            return node

        default:
            return node
    }
}
