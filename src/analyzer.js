import * as core from './core.js'

class Context {
    constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
        this.parent = parent
        this.locals = locals
        this.inLoop = inLoop
        this.function = f
    }

    add(name, entity) {
        if (this.locals.has(name)) {
            throw new Error(`Identifier ${name} already declared`)
        }
        this.locals.set(name, entity)
    }

    lookup(name) {
        return this.locals.get(name) || this.parent?.lookup(name)
    }

    static root() {
        const context = new Context({})
        context.add('int', core.Type.INT)
        context.add('string', core.Type.STRING)
        context.add('bool', core.Type.BOOL)
        context.add('void', core.Type.VOID)
        context.add('true', true)
        context.add('false', false)
        // Basic print function
        context.add('print', new core.FunctionDeclaration('print', [new core.Parameter('arg', core.Type.STRING)], core.Type.VOID, null))
        return context
    }

    newChild(props = {}) {
        return new Context({ ...this, ...props, parent: this, locals: new Map() })
    }
}

function typeOf(node) {
    if (node === true || node === false) return core.Type.BOOL
    if (typeof node === 'number') return core.Type.INT
    if (typeof node === 'string') return core.Type.STRING
    if (node instanceof core.Variable) return node.type
    if (node instanceof core.Call) return node.callee.returnType ?? core.Type.VOID
    if (node instanceof core.BinaryExpression) {
        const relops = ['<', '<=', '>', '>=', '==', '!=', '&&', '||']
        return relops.includes(node.op) ? core.Type.BOOL : core.Type.INT
    }
    if (node instanceof core.UnaryExpression) {
        return node.op === '!' ? core.Type.BOOL : core.Type.INT
    }
    if (node instanceof core.MemberExpression) return core.Type.INT
    return core.Type.INT
}

export default function analyze(match) {
    // We pass the context as an argument to the semantic operation
    const semantics = match.matcher.grammar.createSemantics()

    semantics.addOperation('rep(context)', {
        Program(decls) {
            return new core.Program(decls.children.map(d => d.rep(this.args.context)))
        },

        TypeDecl(struct, id, open, fields, close) {
            const name = id.sourceString
            const type = new core.StructDeclaration(name, [])
            this.args.context.add(name, type)
            type.fields = fields.children.map(f => f.rep(this.args.context))
            return type
        },

        Field(id, colon, type) {
            return new core.Field(id.sourceString, type.rep(this.args.context))
        },

        FunDecl(fn, id, open, params, close, arrow, retType, block) {
            const name = id.sourceString
            const returnType = retType.children.length > 0 ? retType.children[0].rep(this.args.context) : core.Type.VOID
            const fun = new core.FunctionDeclaration(name, [], returnType, null)
            this.args.context.add(name, fun)
            const childContext = this.args.context.newChild({ function: fun })
            fun.params = params.asIteration().children.map(p => p.rep(childContext))
            fun.body = block.rep(childContext)
            return fun
        },

        Param(id, colon, type) {
            const param = new core.Parameter(id.sourceString, type.rep(this.args.context))
            this.args.context.add(param.name, param)
            return param
        },

        VarDecl_init(letKw, id, colon, type, eq, exp, semi) {
            const declaredType = type.rep(this.args.context)
            const initializer = exp.rep(this.args.context)
            const initType = typeOf(initializer)
            if (initType !== declaredType) {
                throw new Error(`Type mismatch: expected ${declaredType.name}, got ${initType.name}`)
            }
            const variable = new core.VariableDeclaration(id.sourceString, declaredType, initializer)
            this.args.context.add(variable.name, variable)
            return variable
        },

        VarDecl_infer(letKw, id, eq, exp, semi) {
            const initializer = exp.rep(this.args.context)
            const variable = new core.VariableDeclaration(id.sourceString, core.Type.INT, initializer)
            this.args.context.add(variable.name, variable)
            return variable
        },

        Stmt_vardecl(v) {
            return v.rep(this.args.context)
        },

        Stmt_return(ret, exp, semi) {
            const expression = exp.children.length > 0 ? exp.children[0].rep(this.args.context) : null
            return new core.ReturnStatement(expression)
        },

        Stmt_print(p, open, exp, close, semi) {
            return new core.PrintStatement(exp.rep(this.args.context))
        },

        Stmt_break(b, semi) {
            if (!this.args.context.inLoop) throw new Error("Break outside loop")
            return new core.BreakStatement()
        },

        Stmt_if(ifKw, exp, block1, elseKw, block2) {
            const test = exp.rep(this.args.context)
            const consequent = block1.rep(this.args.context)
            const alternate = block2.children.length > 0 ? block2.children[0].rep(this.args.context) : null
            return new core.IfStatement(test, consequent, alternate)
        },

        Stmt_while(whileKw, exp, block) {
            const loopContext = this.args.context.newChild({ inLoop: true })
            return new core.WhileStatement(exp.rep(this.args.context), block.rep(loopContext))
        },

        Stmt_block(b) {
            return b.rep(this.args.context)
        },

        Stmt_assign(a, semi) {
            return a.rep(this.args.context)
        },

        Stmt_call(c, semi) {
            return c.rep(this.args.context)
        },

        Block(open, stmts, close) {
            const childContext = this.args.context.newChild()
            return new core.Block(stmts.children.map(s => s.rep(childContext)))
        },

        Assignment(id, eq, exp) {
            const variable = this.args.context.lookup(id.sourceString)
            if (!variable) throw new Error(`Undeclared identifier ${id.sourceString}`)
            return new core.Assignment(variable, exp.rep(this.args.context))
        },

        Call(id, open, argsList, close) {
            const callee = this.args.context.lookup(id.sourceString)
            if (!callee) throw new Error(`Undeclared identifier ${id.sourceString}`)
            const argsRep = argsList.asIteration().children.map(a => a.rep(this.args.context))
            if (callee.params && argsRep.length !== callee.params.length) {
                throw new Error(`Expected ${callee.params.length} arguments but got ${argsRep.length}`)
            }
            return new core.Call(callee, argsRep)
        },

        Exp_or(left, op, right) {
            return new core.BinaryExpression(op.sourceString, left.rep(this.args.context), right.rep(this.args.context))
        },
        Exp_next(e) { return e.rep(this.args.context) },
        Exp1_and(left, op, right) {
            return new core.BinaryExpression(op.sourceString, left.rep(this.args.context), right.rep(this.args.context))
        },
        Exp1_next(e) { return e.rep(this.args.context) },
        Exp2_compare(left, op, right) {
            return new core.BinaryExpression(op.sourceString, left.rep(this.args.context), right.rep(this.args.context))
        },
        Exp2_next(e) { return e.rep(this.args.context) },
        Exp3_add(left, op, right) {
            return new core.BinaryExpression(op.sourceString, left.rep(this.args.context), right.rep(this.args.context))
        },
        Exp3_next(e) { return e.rep(this.args.context) },
        Exp4_mul(left, op, right) {
            return new core.BinaryExpression(op.sourceString, left.rep(this.args.context), right.rep(this.args.context))
        },
        Exp4_next(e) { return e.rep(this.args.context) },
        Exp5_unary(op, operand) {
            return new core.UnaryExpression(op.sourceString, operand.rep(this.args.context))
        },
        Exp5_next(e) { return e.rep(this.args.context) },

        Exp6_member(object, dot, field) {
            return new core.MemberExpression(object.rep(this.args.context), field.sourceString)
        },
        Exp6_next(e) { return e.rep(this.args.context) },

        Exp7_parens(open, exp, close) { return exp.rep(this.args.context) },
        Exp7_id(id) {
            const entity = this.args.context.lookup(id.sourceString)
            if (!entity) throw new Error(`Undeclared identifier ${id.sourceString} in expression`)
            if (entity.constructor.name === 'VariableDeclaration' || entity.constructor.name === 'Parameter') {
                return new core.Variable(entity.name, entity.type)
            }
            return entity
        },

        intlit(digits) { return parseInt(this.sourceString) },
        strlit(open, chars, close) { return this.sourceString },
        true(_) { return true },
        false(_) { return false },

        Type(id) {
            const type = this.args.context.lookup(id.sourceString)
            if (!type) throw new Error(`Unknown type ${id.sourceString}`)
            return type
        }
    })

    // Start semantic analysis with root context containing built-in types and functions
    // The operation argument 'context' is accessed via this.args.context in semantic actions
    return semantics(match).rep(Context.root())
}
