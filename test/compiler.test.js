import { assert } from 'chai'
import { compile } from '../src/crit.js'

describe('The Compiler', () => {
    it('compiles valid code to string', () => {
        const source = `
      fn f(x: int) -> int { return x + 1; }
      print(f(10));
    `
        const js = compile(source)
        assert.include(js, 'function f(x) {')
        assert.include(js, 'console.log(f(10))')
    })

    it('compiles structs to classes', () => {
        const source = `struct Point { x: int y: int }`
        const js = compile(source)
        assert.include(js, 'class Point')
        assert.include(js, 'constructor(x, y)')
    })

    it('compiles while loop with break', () => {
        const source = `
            let i: int = 0;
            while i < 10 {
                if i == 5 { break; }
                i = i + 1;
            }
        `
        const js = compile(source)
        assert.include(js, 'while')
        assert.include(js, 'break')
    })

    it('compiles boolean expressions', () => {
        const source = `
            fn is_teen(age: int) -> bool {
                return age >= 13 && age <= 19;
            }
            let result: bool = is_teen(15);
            print(result);
        `
        const js = compile(source)
        assert.include(js, 'function is_teen(age)')
        assert.include(js, '&&')
        assert.include(js, 'console.log(result)')
    })

    it('compiles arithmetic operators', () => {
        const source = `
            fn square(n: int) -> int { return n * n; }
            fn remainder(a: int, b: int) -> int { return a % b; }
            print(square(7));
            print(remainder(17, 5));
        `
        const js = compile(source)
        assert.include(js, 'function square(n)')
        assert.include(js, '* n')
        assert.include(js, '%')
    })

    it('compiles type inference', () => {
        const source = `
            let count = 0;
            let flag = true;
            count = count + 1;
            let doubled = count * 2;
        `
        const js = compile(source)
        assert.include(js, 'let count = 0')
        assert.include(js, 'let flag = true')
        assert.include(js, 'let doubled')
    })

    it('compiles function composition', () => {
        const source = `
            fn double(n: int) -> int { return n * 2; }
            fn increment(n: int) -> int { return n + 1; }
            let result: int = increment(double(3));
            print(result);
        `
        const js = compile(source)
        assert.include(js, 'function double(n)')
        assert.include(js, 'function increment(n)')
        assert.include(js, 'increment(double(3))')
    })

    it('compiles if with else branch', () => {
        const source = `
            let x: int = 1;
            if x == 1 { print(x); } else { print(x); }
        `
        const js = compile(source)
        assert.include(js, 'if (')
        assert.include(js, 'else {')
    })

    it('compiles member access', () => {
        const source = `
            struct Point { x: int y: int }
            let p = Point(3, 4);
            print(p.x);
        `
        const js = compile(source)
        assert.include(js, 'p.x')
    })

    it('compiles return with value', () => {
        const source = `fn abs(n: int) -> int { if n < 0 { return -n; } return n; }`
        const js = compile(source)
        assert.include(js, 'return')
        assert.include(js, 'function abs(n)')
    })

    it('compiles unary expressions', () => {
        const source = `let b: bool = false; let nb: bool = !b; let x: int = 1; let nx: int = -x;`
        const js = compile(source)
        assert.include(js, '! b')
        assert.include(js, '- x')
    })
})
