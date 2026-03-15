# Crit (Critical Hit)

<img src="docs/logo.png" alt="Crit Logo" width="300">

Crit is a statically typed, educational programming language with C-like syntax that compiles to JavaScript. Designed for clarity and correctness, Crit catches errors at compile time so your code lands every hit. The compiler is built in JavaScript using the [Ohm.js](https://ohmjs.org/) parsing framework.

## Story

Crit takes its name from the tabletop RPG concept of rolling a natural 20, a critical hit. In those games, a crit means you executed perfectly: no fumbles, no wasted moves. That's the philosophy behind this language. The compiler is your dungeon master, and it does not let mistakes slide. Every type error, undeclared variable, and argument mismatch is caught at compile time, long before your program ever runs.

The language was designed to be minimal and teachable. Its C-like syntax is immediately readable to anyone with programming experience, while its static type system enforces discipline. There is no runtime ambiguity.  What you declare is what you get. Structs compile to ES6 classes, functions map directly to JavaScript functions, and the optimizer folds constant expressions away before code is ever emitted.

Crit is built as a project to explore the full compiler pipeline: PEG grammars with Ohm.js, context-based semantic analysis, AST construction, constant folding, and code generation.  All in one focused, readable codebase. If you are learning how compilers work, or just want a language where the rules are enforced by the toolchain rather than by convention, Crit is built for you.

## Features

- **Static Typing**: Types are checked at compile time with explicit annotations (`: int`, `: string`, etc.)
- **Type Inference**: Declare variables without annotations (`let x = 10;`)
- **Structs**: Define custom data structures with typed fields
- **Functions**: First-class functions with typed parameters and return types
- **Control Flow**: `if/else`, `while`, `break`, `return`
- **Built-in Output**: `print()` for console output
- **Comments**: C-style line comments with `//`

## Static Analysis & Safety

The Crit compiler performs several compile-time checks:
- **Scope Resolution**: Prevents usage of undeclared variables
- **Redeclaration Prevention**: No duplicate declarations in the same scope
- **Break Validation**: `break` statements only allowed inside loops
- **Type Safety**: Ensures operations are performed on compatible types
- **Parameter Matching**: Checks argument counts and types in function calls
- **Return Checks**: Ensures functions return the declared type

## Usage

Prerequisites: Node.js >= 18.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile a program:
   ```bash
   node src/compiler.js examples/fibonacci.crit
   ```
   This outputs the compiled JavaScript to stdout.

3. Analyze a program (AST output):
   ```bash
   node src/compiler.js -a examples/fibonacci.crit
   ```

## Testing

Run the full test suite:
```bash
npm test
```

Run a single test file:
```bash
npx mocha test/compiler.test.js
```

Check code formatting:
```bash
npm run lint
```

Auto-format code:
```bash
npm run format
```

## Examples

### Fibonacci

```
fn fib(n: int) -> int {
  if n <= 1 {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

print(fib(10));
```

### Factorial

```
fn factorial(n: int) -> int {
  if n <= 1 { return 1; }
  return n * factorial(n - 1);
}

print(factorial(5));
```

### Structs

```
struct Point {
  x: int
  y: int
}

fn add_points(p1: Point, p2: Point) -> Point {
  return Point(p1.x + p2.x, p1.y + p2.y);
}

let p1 = Point(1, 2);
let p2 = Point(3, 4);
let p3 = add_points(p1, p2);

print(p3.x);
print(p3.y);
```

### While Loop with Break

```
let i = 0;
while i < 100 {
  if i == 10 {
    break;
  }
  print(i);
  i = i + 1;
}
```

### Boolean Logic

```
fn is_valid(x: int, y: int) -> bool {
  return x > 0 && y > 0 || x == y;
}

let result: bool = is_valid(3, 5);
print(result);
```

## Companion Website

See the [Crit companion website](https://amcvoid.github.io/crit/) for a full overview, syntax-highlighted examples, and grammar reference.

## GitHub

[Crit on GitHub](https://github.com/AmcVoid/crit)

## Grammar

The full Crit grammar is defined in [`src/crit.ohm`](src/crit.ohm) using the Ohm.js PEG-based framework. See the grammar file for the complete syntax specification.

## Author

Aaron McBride

## License

See [LICENSE](LICENSE) for details.
