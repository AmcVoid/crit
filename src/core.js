export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class VariableDeclaration {
  constructor(name, type, initializer) {
    this.name = name
    this.type = type
    this.initializer = initializer
  }
}

export class FunctionDeclaration {
  constructor(name, params, returnType, body) {
    this.name = name
    this.params = params
    this.returnType = returnType
    this.body = body
  }
}

export class StructDeclaration {
  constructor(name, fields) {
    this.name = name
    this.fields = fields
  }
}

export class Field {
  constructor(name, type) {
    this.name = name
    this.type = type
  }
}

export class Parameter {
  constructor(name, type) {
    this.name = name
    this.type = type
  }
}

export class Type {
  constructor(name) {
    this.name = name
  }
  static INT = new Type('int')
  static FLOAT = new Type('float') 
  static STRING = new Type('string')
  static BOOL = new Type('bool')
  static VOID = new Type('void')
}

export class Assignment {
  constructor(target, source) {
    this.target = target
    this.source = source
  }
}

export class ReturnStatement {
  constructor(expression) {
    this.expression = expression
  }
}

export class BreakStatement {
  constructor() { }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
  }
}

export class WhileStatement {
  constructor(test, body) {
    this.test = test
    this.body = body
  }
}

export class Block {
  constructor(statements) {
    this.statements = statements
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class Call {
  constructor(callee, args) {
    this.callee = callee
    this.args = args
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    this.op = op
    this.left = left
    this.right = right
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    this.op = op
    this.operand = operand
  }
}

export class MemberExpression {
  constructor(object, field) {
    this.object = object
    this.field = field
  }
}

export class Variable {
  constructor(name, type) {
    this.name = name
    this.type = type
  }
}

