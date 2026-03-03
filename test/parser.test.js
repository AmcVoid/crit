import { assert } from 'chai'
import { parse } from '../src/parser.js'

const syntaxChecks = [
    ['valid variable declaration', 'let x: int = 5;'],
    ['valid inference', 'let x = 5;'],
    ['valid function', 'fn f(x: int) -> int { return x; }'],
    ['valid struct', 'struct S { x: int y: bool }'],
    ['valid if', 'if true { print(1); } else { print(2); }'],
    ['valid if without else', 'if true { print(1); }'],
    ['valid while', 'while x < 10 { x = x + 1; }'],
    ['valid while with break', 'while true { break; }'],
    ['valid call', 'f(1, 2, 3);'],
    ['valid call no args', 'f();'],
    ['valid arithmetic', 'let x = 1 + 2 * 3;'],
    ['valid relational ops', 'let x = 1 != 2;'],
    ['valid boolean ops', 'let x = true || false;'],
    ['valid unary ops', 'let x = !true;'],
    ['valid member access', 'let x = s.field;'],
    ['valid string literal', 'let x = "hello";'],
    ['valid return void', 'fn f() { return; }'],
    ['valid nested blocks', '{ { let x = 1; } }'],
    ['valid comment', '// this is a comment\nlet x = 1;'],
    ['valid parenthesized expr', 'let x = (1 + 2) * 3;'],
]

const syntaxErrors = [
    ['invalid variable', 'let x: int = ;'],
    ['invalid function', 'fn f(x) { }'],
    ['invalid struct', 'struct S { x int }'],
    ['keyword as id', 'let if = 5;'],
    ['missing semicolon', 'let x = 5'],
    ['invalid type annotation', 'let x: = 5;'],
]

describe('The Parser', () => {
    syntaxChecks.forEach(([scenario, code]) => {
        it(`parses ${scenario}`, () => {
            assert.doesNotThrow(() => parse(code))
        })
    })
    syntaxErrors.forEach(([scenario, code]) => {
        it(`rejects ${scenario}`, () => {
            assert.throws(() => parse(code))
        })
    })
})
