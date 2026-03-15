import { assert } from 'chai'
import fs from 'fs'
import * as ohm from 'ohm-js'
import analyze from '../src/analyzer.js'

const grammar = ohm.grammar(fs.readFileSync('src/crit.ohm', 'utf-8'))

const semanticChecks = [
    ['variables', 'let x: int = 1; let y = x;'],
    ['functions', 'fn f(x: int) -> int { return x; } let y = f(1);'],
    ['structs', 'struct S { x: int } let s = S(1);'],
    ['scope', 'let x = 1; { let x = 2; }'],
    ['return', 'fn f() -> void { return; }'],
    ['while loop', 'let x: int = 0; while x < 10 { x = x + 1; }'],
    ['break in loop', 'while true { break; }'],
    ['if else', 'let x: int = 1; if x == 1 { print(x); } else { print(x); }'],
    ['member access on struct', 'struct P { x: int } let p = P(1); let v = p.x;'],
    ['bool variable', 'let b: bool = true;'],
    ['multiple params', 'fn add(a: int, b: int) -> int { return a + b; } let r: int = add(1, 2);'],
    ['assignment', 'let x: int = 0; x = 5;'],
    ['unary negation', 'let x: int = -1;'],
    ['unary not', 'let b: bool = !false;'],
    ['type inference infers from bool', 'let b = true;'],
    ['member expression type inference', 'struct P { x: int } let p = P(1); let v: int = p.x;'],
    ['function used as callee (entity return)', 'fn f() -> void {} f();'],
    ['struct used as callee (entity return)', 'struct S { x: int } let s = S(1);'],
    ['function reference as callee entity', 'fn f(x: int) -> int { return x; } let r: int = f(f(1));'],
    ['struct type used as function param type', 'struct S { x: int } fn g(s: S) -> void { print(s.x); } let s = S(1); g(s);'],
]

const semanticErrors = [
    ['undeclared variable', 'print(x);', /Undeclared identifier/],
    ['redeclaration', 'let x = 1; let x = 2;', /Identifier x already declared/],
    ['type mismatch in var decl', 'let x: int = true;', /Type mismatch/],
    ['break outside loop', 'break;', /Break outside loop/],
    ['bad arg count', 'fn f(x: int) -> void {} f();', /Expected 1 arguments/],
]

describe('The Analyzer', () => {
    semanticChecks.forEach(([scenario, code]) => {
        it(`accepts ${scenario}`, () => {
            const match = grammar.match(code)
            if (match.failed()) throw new Error(match.message)
            analyze(match)
        })
    })

    semanticErrors.forEach(([scenario, code, errorPattern]) => {
        it(`rejects ${scenario}`, () => {
            const match = grammar.match(code)
            assert.throws(() => analyze(match), errorPattern)
        })
    })
})
