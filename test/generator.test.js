import { assert } from 'chai'
import generate from '../src/generator.js'
import * as core from '../src/core.js'

// Helper: wrap statements in a Program and generate
const gen = (...stmts) => generate(new core.Program(stmts))

describe('The Generator', () => {
    it('generates variable declaration', () => {
        const node = new core.VariableDeclaration('x', core.Type.INT, 42)
        assert.include(gen(node), 'let x = 42')
    })

    it('generates function declaration', () => {
        const param = new core.Parameter('n', core.Type.INT)
        const body = new core.Block([new core.ReturnStatement(new core.Variable('n', core.Type.INT))])
        const node = new core.FunctionDeclaration('id', [param], core.Type.INT, body)
        const js = gen(node)
        assert.include(js, 'function id(n) {')
        assert.include(js, 'return n')
    })

    it('generates struct declaration', () => {
        const fields = [new core.Field('x', core.Type.INT), new core.Field('y', core.Type.INT)]
        const node = new core.StructDeclaration('Point', fields)
        const js = gen(node)
        assert.include(js, 'class Point')
        assert.include(js, 'constructor(x, y)')
        assert.include(js, 'this.x = x')
    })

    it('generates return statement', () => {
        const node = new core.ReturnStatement(5)
        assert.include(gen(node), 'return 5')
    })

    it('generates print statement', () => {
        const node = new core.PrintStatement(new core.Variable('x', core.Type.INT))
        assert.include(gen(node), 'console.log(x)')
    })

    it('generates if statement without else', () => {
        const test = new core.BinaryExpression('>', new core.Variable('x', core.Type.INT), 0)
        const body = new core.Block([new core.PrintStatement(new core.Variable('x', core.Type.INT))])
        const node = new core.IfStatement(test, body, null)
        const js = gen(node)
        assert.include(js, 'if (')
        assert.notInclude(js, 'else')
    })

    it('generates if statement with else', () => {
        const test = true
        const cons = new core.Block([new core.PrintStatement(1)])
        const alt = new core.Block([new core.PrintStatement(0)])
        const node = new core.IfStatement(test, cons, alt)
        const js = gen(node)
        assert.include(js, 'if (true)')
        assert.include(js, 'else {')
    })

    it('generates while statement', () => {
        const test = new core.BinaryExpression('<', new core.Variable('i', core.Type.INT), 10)
        const body = new core.Block([new core.BreakStatement()])
        const node = new core.WhileStatement(test, body)
        const js = gen(node)
        assert.include(js, 'while (')
        assert.include(js, 'break')
    })

    it('generates break statement', () => {
        assert.include(gen(new core.BreakStatement()), 'break;')
    })

    it('generates assignment', () => {
        const target = new core.Variable('x', core.Type.INT)
        const node = new core.Assignment(target, 99)
        assert.include(gen(node), 'x = 99')
    })

    it('generates regular function call', () => {
        const callee = new core.FunctionDeclaration('f', [], core.Type.INT, null)
        const node = new core.VariableDeclaration('r', core.Type.INT, new core.Call(callee, [5]))
        assert.include(gen(node), 'f(5)')
    })

    it('generates struct constructor call with new', () => {
        const fields = [new core.Field('x', core.Type.INT)]
        const callee = new core.StructDeclaration('Point', fields)
        const node = new core.VariableDeclaration('p', callee, new core.Call(callee, [1]))
        assert.include(gen(node), 'new Point(1)')
    })

    it('generates binary expression', () => {
        const node = new core.VariableDeclaration('x', core.Type.INT,
            new core.BinaryExpression('+', 2, 3))
        assert.include(gen(node), '(2 + 3)')
    })

    it('generates unary expression', () => {
        const node = new core.VariableDeclaration('x', core.Type.INT,
            new core.UnaryExpression('-', new core.Variable('n', core.Type.INT)))
        assert.include(gen(node), '(- n)')
    })

    it('generates member expression', () => {
        const obj = new core.Variable('p', core.Type.INT)
        const node = new core.VariableDeclaration('v', core.Type.INT,
            new core.MemberExpression(obj, 'x'))
        assert.include(gen(node), 'p.x')
    })

    it('generates boolean literal true', () => {
        const node = new core.VariableDeclaration('b', core.Type.BOOL, true)
        assert.include(gen(node), 'let b = true')
    })

    it('generates boolean literal false', () => {
        const node = new core.VariableDeclaration('b', core.Type.BOOL, false)
        assert.include(gen(node), 'let b = false')
    })

    it('generates integer literal', () => {
        const node = new core.VariableDeclaration('n', core.Type.INT, 42)
        assert.include(gen(node), 'let n = 42')
    })

    it('generates string literal', () => {
        const node = new core.VariableDeclaration('s', core.Type.STRING, 'hello')
        assert.include(gen(node), '"hello"')
    })

    it('generates Parameter node as expression', () => {
        const param = new core.Parameter('p', core.Type.INT)
        const node = new core.ReturnStatement(param)
        assert.include(gen(node), 'return p')
    })

    it('generates Field node as expression', () => {
        const field = new core.Field('x', core.Type.INT)
        const node = new core.ReturnStatement(field)
        assert.include(gen(node), 'return x')
    })

    it('generates string via default branch', () => {
        const node = new core.PrintStatement('world')
        assert.include(gen(node), '"world"')
    })

    it('generates number via default branch', () => {
        const node = new core.PrintStatement(99)
        assert.include(gen(node), '99')
    })

    it('generates boolean via default branch', () => {
        const node = new core.PrintStatement(false)
        assert.include(gen(node), 'false')
    })
})
