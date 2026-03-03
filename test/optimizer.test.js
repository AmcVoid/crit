import { assert } from 'chai'
import { compile } from '../src/crit.js'

describe('The Optimizer', () => {
    it('folds integer addition', () => {
        const js = compile('let x: int = 2 + 3;')
        assert.include(js, 'let x = 5')
        assert.notInclude(js, '2 + 3')
    })

    it('folds integer subtraction', () => {
        const js = compile('let x: int = 10 - 4;')
        assert.include(js, 'let x = 6')
    })

    it('folds integer multiplication', () => {
        const js = compile('let x: int = 3 * 4;')
        assert.include(js, 'let x = 12')
    })

    it('folds integer division', () => {
        const js = compile('let x: int = 10 / 3;')
        assert.include(js, 'let x = 3')
    })

    it('folds integer modulo', () => {
        const js = compile('let x: int = 17 % 5;')
        assert.include(js, 'let x = 2')
    })

    it('folds nested constant expressions', () => {
        const js = compile('let x: int = 2 + 3 * 4;')
        assert.include(js, 'let x = 14')
        assert.notInclude(js, '2 + 3')
    })

    it('folds boolean and', () => {
        const js = compile('let x: bool = true && false;')
        assert.include(js, 'let x = false')
    })

    it('folds boolean or', () => {
        const js = compile('let x: bool = false || true;')
        assert.include(js, 'let x = true')
    })

    it('folds unary negation', () => {
        const js = compile('let x: int = -5;')
        assert.include(js, 'let x = -5')
    })

    it('folds unary not', () => {
        const js = compile('let x: bool = !true;')
        assert.include(js, 'let x = false')
    })

    it('does not fold non-constant expressions', () => {
        const js = compile('let x: int = 1; let y: int = x + 2;')
        assert.include(js, 'x + 2')
    })

    it('folds constant comparison to true', () => {
        const js = compile('let b: bool = 5 > 3;')
        assert.include(js, 'let b = true')
    })

    it('folds constant comparison to false', () => {
        const js = compile('let b: bool = 2 >= 10;')
        assert.include(js, 'let b = false')
    })

    it('folds equality comparison', () => {
        const js = compile('let b: bool = 4 == 4;')
        assert.include(js, 'let b = true')
    })

    it('folds inequality comparison', () => {
        const js = compile('let b: bool = 3 != 3;')
        assert.include(js, 'let b = false')
    })

    it('folds deeply nested arithmetic', () => {
        const js = compile('let x: int = (2 + 3) * (4 - 1);')
        assert.include(js, 'let x = 15')
    })

    it('folds constants inside if condition', () => {
        const js = compile('if 1 < 2 { print(1); }')
        assert.include(js, 'if (true)')
    })

    it('folds constants inside print', () => {
        const js = compile('print(3 + 4);')
        assert.include(js, 'console.log(7)')
    })

    it('folds constants inside assignment', () => {
        const js = compile('let x: int = 0; x = 2 + 3;')
        assert.include(js, 'x = 5')
    })

    it('folds constants inside function call args', () => {
        const js = compile('fn f(n: int) -> int { return n; } let r: int = f(2 + 3);')
        assert.include(js, 'f(5)')
    })

    it('does not fold unary on non-constant', () => {
        const js = compile('let x: int = 1; let y: int = -x;')
        assert.include(js, '- x')
    })

    it('folds constants inside while body', () => {
        const js = compile('let i: int = 0; while i < 10 { print(2 + 2); i = i + 1; }')
        assert.include(js, 'console.log(4)')
    })

    it('folds constants inside if/else branches', () => {
        const js = compile('let x: int = 1; if x == 1 { print(1 + 1); } else { print(2 + 2); }')
        assert.include(js, 'console.log(2)')
        assert.include(js, 'console.log(4)')
    })

    it('folds constants inside member access expression', () => {
        const js = compile('struct P { x: int } let p = P(1 + 1); print(p.x);')
        assert.include(js, 'new P(2)')
        assert.include(js, 'p.x')
    })
})
