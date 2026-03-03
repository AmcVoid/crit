import fs from 'fs'
import * as ohm from 'ohm-js'

const grammar = ohm.grammar(fs.readFileSync(new URL('./crit.ohm', import.meta.url), 'utf-8'))

export function parse(source) {
    const match = grammar.match(source)
    if (match.failed()) throw new Error(match.message)
    return match
}
