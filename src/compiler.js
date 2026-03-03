import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { parse } from './parser.js'
import analyze from './analyzer.js'
import optimize from './optimizer.js'
import { compile } from './crit.js'

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options] <filename>')
    .option('analyze', {
        alias: 'a',
        description: 'Analyze the code and print AST',
        type: 'boolean',
        default: false
    })
    .demandCommand(1, 'You must provide a filename')
    .help('h')
    .alias('h', 'help')
    .argv

const filename = argv._[0]

try {
    const source = fs.readFileSync(filename, 'utf-8')

    if (argv.analyze) {
        const ast = optimize(analyze(parse(source)))
        console.log(JSON.stringify(ast, (key, value) => {
            if (key === 'parent') return undefined
            if (value instanceof Map) return Object.fromEntries(value)
            return value
        }, 2))
        process.exit(0)
    }

    console.log(compile(source))

} catch (e) {
    console.error(e.message)
    process.exit(1)
}
