import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { parse } from './parser.js'
import analyze from './analyzer.js'
import optimize from './optimizer.js'
import { compile } from './crit.js'

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options] <filename>')
    .option('syntax', {
        alias: 's',
        description: 'Check syntax only',
        type: 'boolean',
        default: false
    })
    .option('parse', {
        alias: 'p',
        description: 'Parse and print the parse tree',
        type: 'boolean',
        default: false
    })
    .option('analyze', {
        alias: 'a',
        description: 'Analyze the code and print AST',
        type: 'boolean',
        default: false
    })
    .option('optimize', {
        alias: 'o',
        description: 'Analyze, optimize, and print AST',
        type: 'boolean',
        default: false
    })
    .demandCommand(1, 'You must provide a filename')
    .help('h')
    .alias('h', 'help')
    .argv

const filename = argv._[0]

function safeStringify(obj) {
    const seen = new WeakSet()
    return JSON.stringify(obj, (key, value) => {
        if (key === 'parent') return undefined
        if (value instanceof Map) return Object.fromEntries(value)
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]'
            seen.add(value)
        }
        return value
    }, 2)
}

try {
    const source = fs.readFileSync(filename, 'utf-8')

    if (argv.syntax) {
        parse(source)
        console.log('Syntax OK')
        process.exit(0)
    }

    if (argv.parse) {
        const match = parse(source)
        console.log(match.succeeded() ? 'Parse OK' : 'Parse failed')
        process.exit(0)
    }

    if (argv.analyze) {
        const ast = analyze(parse(source))
        console.log(safeStringify(ast))
        process.exit(0)
    }

    if (argv.optimize) {
        const ast = optimize(analyze(parse(source)))
        console.log(safeStringify(ast))
        process.exit(0)
    }

    console.log(compile(source))

} catch (e) {
    console.error(e.message)
    process.exit(1)
}
