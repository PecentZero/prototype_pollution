import {
  log,
  header,
  warn,
  todo,
  parse,
  Range,
  createBoolLiteral,
  createTemplateElement,
} from './helper';

const util = require("util");
import {
  Mutant,
  MutantType,
} from './tester';

import { green } from 'chalk';

import acorn, { ChainExpression } from 'acorn';
import {
  AssignmentOperator,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  ConditionalExpression,
  Expression,
  IfStatement,
  LogicalExpression,
  LogicalOperator,
  Node,
} from 'acorn';

import walk from 'acorn-walk';

import { generate } from 'astring';

/* Mutator
 *
 * (Problem #1) Mutation Operation (70 points)
 *
 * Please implement the missing parts (denoted by todo() functions).
 *
 * The goal of this project to generate mutants from a given JavaScript code
 * and to measure the mutation score of a test suite as its adequacy criterion.
 */
export class Mutator {
  code: string;
  mutants: Mutant[];
  ast: Node;
  beautified: string;
  detail: boolean;

  // Generate mutants from the code
  static from(code: string, detail: boolean = false): Mutant[] {
    const mutator = new Mutator(code, detail);
    return mutator.mutants;
  }

  // Constructor
  constructor(code: string, detail: boolean = false) {
    this.code = code;
    this.mutants = [];
    this.ast = parse(this.code);
    this.beautified = generate(this.ast);
    this.detail = detail;
    this.generateMutants();
  }

  // Generate mutants
  generateMutants = (): void => {
    const { ast, beautified: before, visitor, detail } = this;
    if (detail) header('Generating Mutants...');
    walk.recursive(ast, null, visitor);
    const after = generate(ast);
    if (before !== after) {
      warn('The AST is changed after generating mutants');
    }
  }

  // Add a mutant to the list with its type and the target node
  addMutant = (type: MutantType, node: Node): void => {
    const { mutants, code, ast, beautified, detail } = this;
    const id = mutants.length + 1;
    const mutated = generate(ast);
    const range = Range.fromNode(code, node);
    const after = generate(node);
    const mutant = new Mutant(id, type, mutated, code, range, after);
    mutants.push(mutant);
    if (beautified == mutated) {
      warn('The code is the same after generating a mutant');
      warn(mutant);
    } else if (detail) {
      log(mutant, green);
    }
  }

  // Visitor for generating mutants
  visitor: walk.RecursiveVisitors<any> = {
    ArrayExpression: (node) => { 
      console.log("ArrayExpression",node);
      const { visitor, addMutant} = this;
      const { elements } = node;
      if(elements.length > 0)
      {
        node.elements = new Array();
        addMutant(MutantType.ArrayDecl, node);
        node.elements = elements;
        for(let idx of node.elements) {
          if(idx) {
            walk.recursive(idx, null, visitor);
          }
        }
      }
      
    },
    AssignmentExpression: (node) => {
      const { visitor, addMutant} = this;
      const { left,right,operator } = node;
      console.log("AssignmentExpression",node);
      switch (operator) {
        case '+=':
          node.operator = '-=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '-=':
          node.operator = '+=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '*=':
          node.operator = '/=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '/=':
          node.operator = '*=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '%=':
          node.operator = '*=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '<<=':
          node.operator = '>>=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '>>=':
          node.operator = '<<=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '&=':
          node.operator = '|=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '|=':
          node.operator = '&=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
        case '??=':
          node.operator = '&&=';
          addMutant(MutantType.AssignExpr, node);
          node.operator = operator;
          break;
      }
      walk.recursive(left, null, visitor)
      walk.recursive(right, null, visitor)
    },
    BinaryExpression: (node) => {
      const { visitor, addMutant} = this;
      const { left,right,operator } = node;
      console.log("BinaryExpression",node);
      switch (operator) {
        case '+':
          node.operator = '-';
          addMutant(MutantType.Arithmetic, node);
          node.operator = operator;
          break;
        case '-':
          node.operator = '+';
          addMutant(MutantType.Arithmetic, node);
          node.operator = operator;
          break;
        case '*':
          node.operator = '/';
          addMutant(MutantType.Arithmetic, node);
          node.operator = '%';
          addMutant(MutantType.Arithmetic, node);
          node.operator = operator;
          break;
        case '/':
          node.operator = '*';
          addMutant(MutantType.Arithmetic, node);
          node.operator = '%';
          addMutant(MutantType.Arithmetic, node);
          node.operator = operator;
          break;
        case '%':
          node.operator = '*';
          addMutant(MutantType.Arithmetic, node);
          node.operator = '/';
          addMutant(MutantType.Arithmetic, node);
          node.operator = operator;
          break;
        case '<':
          node.operator = '<=';
          addMutant(MutantType.EqualityOp, node);
          node.operator = '>=';
          addMutant(MutantType.EqualityOp, node);
          node.operator = operator;
          break;
        case '<=':
          node.operator = '<';
          addMutant(MutantType.EqualityOp, node);
          node.operator = '>';
          addMutant(MutantType.EqualityOp, node);
          node.operator = operator;
          break;
        case '>':
          node.operator = '>=';
          addMutant(MutantType.EqualityOp, node);
          node.operator = '<=';
          addMutant(MutantType.EqualityOp, node);
          node.operator = operator;
          break;
        case '>=':
          node.operator = '>';
          addMutant(MutantType.EqualityOp, node);
          node.operator = '<';
          addMutant(MutantType.EqualityOp, node);
          node.operator = operator;
          break;
        case '==':
          node.operator = '!=';
          addMutant(MutantType.EqualityOp, node);
          if(!((node.left.type == "Literal" && node.left.value === null) ||(node.right.type == "Literal" && node.right.value === null)))
          {
            node.operator = '===';
            addMutant(MutantType.EqualityOp, node);
          }
          node.operator = operator;
          break;
        case '!=':
          node.operator = '==';
          addMutant(MutantType.EqualityOp, node);
          if(!((node.left.type == "Literal" && node.left.value === null) ||(node.right.type == "Literal" && node.right.value === null)))
          {
            node.operator = '!==';
            addMutant(MutantType.EqualityOp, node);
          }
          node.operator = operator;
          break;
        case '===':
          node.operator = '!==';
          addMutant(MutantType.EqualityOp, node);
          if(!((node.left.type == "Literal" && node.left.value === null) ||(node.right.type == "Literal" && node.right.value === null)))
          {
            node.operator = '==';
            addMutant(MutantType.EqualityOp, node);
          }
          node.operator = operator;
          break;
        case '!==':
          node.operator = '===';
          addMutant(MutantType.EqualityOp, node);
          if(!((node.left.type == "Literal" && node.left.value === null) ||(node.right.type == "Literal" && node.right.value === null)))
          {
          node.operator = '!=';
          addMutant(MutantType.EqualityOp, node);
          }
          node.operator = operator;
          break;
      }
      walk.recursive(left, null, visitor)
      walk.recursive(right, null, visitor)
    },
    BlockStatement: (node) => {
      const { visitor, addMutant } = this;
      const { body } = node;
      console.log("BlockStatement",node);
      if(body.length > 0)
      {node.body = new Array()
      addMutant(MutantType.BlockStmt,node)
      node.body = body
      for(let _node of node.body) { walk.recursive(_node, null, visitor);}
      }
    },
    ChainExpression: (node) => {
      const { visitor, addMutant } = this;
      const { expression } = node;
      console.log("ChainExpression",node);

      let visited = new Array()
      let back = new Array()
      if(node.expression)
      {visited.push(node.expression)
      while(visited[visited.length-1].type == "CallExpression" || visited[visited.length-1].type == "MemberExpression")
      {

        if(visited[visited.length-1].optional)
        {
          visited[visited.length-1].optional = false
          back.push(visited[visited.length-1])
        }

        if(visited[visited.length-1].type == "CallExpression")
        {
          visited.push(visited[visited.length-1].callee)
        }
        else if(visited[visited.length-1].type == "MemberExpression")
        {
         visited.push(visited[visited.length-1].object)
        }

      }
    }
        addMutant(MutantType.OptionalChain,node)
        node.expression = expression
        for(let _back of back){_back.optional = true}
        walk.recursive(visited[0],null,visitor)
      
    },
    ConditionalExpression: (node) => { 
      const { visitor, addMutant } = this;
      const { test, consequent ,alternate } = node;
      console.log("ConditionalExpression",node);
      if(test.type == "Literal" && ((test.raw === 'true' && test.value === true)|| (test.raw === 'false' && test.value === false)))
      {
        test.raw = (!test.value).toString()
        test.value =(!test.value)
        addMutant(MutantType.Cond,node)
        test.raw = (!test.value).toString()
        test.value = (!test.value)
      }
      else
      {
        node.test = createBoolLiteral(true)
        addMutant(MutantType.Cond,node)
        node.test = createBoolLiteral(false)
        addMutant(MutantType.Cond,node)
        node.test = test
      }
      
      for(let _itr of [test,consequent,alternate]) { if(_itr) walk.recursive(_itr,null,visitor)}
    },
    DoWhileStatement: (node) => { 
      const { visitor, addMutant } = this;
      const { test,body } = node;
      console.log("DoWhileStatement",node);

      node.test = createBoolLiteral(false)
      addMutant(MutantType.Cond,node)
      node.test = test

      for(let _itr of [test,body]){ if(_itr) walk.recursive(_itr,null,visitor)}
    },
    ForStatement: (node) => {
      const { visitor, addMutant } = this;
      const { init, test, update } = node;
      console.log("ForStatement",node);

      node.test = createBoolLiteral(false)
      addMutant(MutantType.Cond,node)
      node.test = test
      

      for(let _itr of [init,test,update]){ if(_itr) walk.recursive(_itr,null,visitor)}
    },
    IfStatement: (node) => {
      const { visitor, addMutant } = this;
      const { test, consequent ,alternate } = node;
      console.log("IfStatement",node);
      node.test = createBoolLiteral(true)
      addMutant(MutantType.Cond,node)
      node.test = createBoolLiteral(false)
      addMutant(MutantType.Cond,node)
      node.test = test

      for(let _itr of [test,consequent,alternate]) { if(_itr) walk.recursive(_itr,null,visitor)}
    },
    Literal: (node) => {
      const { visitor, addMutant } = this;
      const { raw ,value } = node;
      console.log("Literal",node);

      if((raw === 'true' && value === true)|| (raw === 'false' && value === false))
      {
        node.raw = (!value).toString()
        node.value =(!value)
        addMutant(MutantType.BooleanLiteral,node)
        node.raw = raw
        node.value = value
      }

      if( typeof(node.value)=="string" && node.raw && node.value == '')
      {
        node.raw = `"`+'__PLRG__' + `"`
        addMutant(MutantType.StringLiteral,node)
        node.raw = raw
      }

      else if( typeof(node.value)=="string" && node.raw && node.value !== '')
      {
        node.raw = `""`
        node.value = ""
        addMutant(MutantType.StringLiteral,node)
        node.raw = raw
        node.value = value
      }
    },
    LogicalExpression: (node) => {
      const { visitor, addMutant } = this;
      const { left, right, operator } = node;
      console.log("LogicalExpression",node);
      switch (operator) {
        case '&&':
          node.operator = '||';
          addMutant(MutantType.LogicalOp, node);
          node.operator = '??';
          addMutant(MutantType.LogicalOp, node);
          node.operator = operator;
          break;
        case '||':
          node.operator = '&&';
          addMutant(MutantType.LogicalOp, node);
          node.operator = '??';
          addMutant(MutantType.LogicalOp, node);
          node.operator = operator;
          break;
        case '??':
          node.operator = '&&';
          addMutant(MutantType.LogicalOp, node);
          node.operator = '||';
          addMutant(MutantType.LogicalOp, node);
          node.operator = operator;
          break;
      }

      for(let _itr of [left,right]) { if(_itr) walk.recursive(_itr,null,visitor)}
    },
    NewExpression: (node) => {
      const { visitor, addMutant } = this;
      const { callee, arguments: args } = node;
      console.log("NewExpression",node);
      if (callee.type == "Identifier" &&  callee.name == "Array" && args.length > 0)
      {
        node.arguments = new Array()
        addMutant(MutantType.ArrayDecl, node);
        node.arguments = args;
      }
      for (const arg of args) walk.recursive(arg, null, visitor);
    },
    ObjectExpression: (node) => {
      const { visitor, addMutant } = this;
      const { properties } = node;
      console.log("ObjectExpression",node);
      if(properties.length > 0)
      {
        node.properties = new Array()
        addMutant(MutantType.ObjectLiteral, node);
        node.properties = properties
      }
      for(let property of properties) {walk.recursive(property,null,visitor)}
    },
    TemplateLiteral: (node) => {
      const { visitor, addMutant } = this;
      const { quasis ,expressions } = node;
      console.log("TemplateLiteral",node);

        node.quasis = new Array()
        if(expressions.length == 0  && quasis.length == 1 && quasis[0].value.raw == ``)
        {
        node.quasis.push(createTemplateElement(`__PLRG__`))
        }
        else
        {
        node.expressions = new Array()
        node.quasis.push(createTemplateElement(``))
        }
        //let temp_raw = _quasis.value.raw
        //let temp_cooked = _quasis.value.cooked
        addMutant(MutantType.StringLiteral, node);

        node.expressions = expressions
        node.quasis = quasis
        for(let expression of expressions) { walk.recursive(expression,null,visitor)}
        
    },
    UnaryExpression: (node) => {
      const { visitor, addMutant } = this;
      const { argument, operator } = node;
      console.log("UnaryExpression",node);
      switch (operator) {
        case '+':
          node.operator = '-';
          addMutant(MutantType.UnaryOp, node);
          node.operator = operator;
          break;
        case '-':
          node.operator = '+';
          addMutant(MutantType.UnaryOp, node);
          node.operator = operator;
          break;
      }
      walk.recursive(argument, null, visitor);
    },
    UpdateExpression: (node) => {
      const { visitor, addMutant} = this;
      const { operator,prefix } = node;
      console.log("UpdateExpression",node);
      switch (operator) {
        case '++':
          node.prefix = !prefix
          addMutant(MutantType.Update, node);
          node.operator = '--';
          node.prefix = prefix
          addMutant(MutantType.Update, node);
          node.operator = operator;
          break;
        case '--':
          node.prefix = !prefix
          addMutant(MutantType.Update, node);
          node.operator = '++';
          node.prefix = prefix
          addMutant(MutantType.Update, node);
          node.operator = operator;
          break;
      }
    },
    WhileStatement: (node) => {
      const { visitor, addMutant } = this;
      const { test,body } = node;
      console.log("WhileStatement",node);

      node.test = createBoolLiteral(false)
      addMutant(MutantType.Cond,node)
      node.test = test

      for(let _itr of [test,body]){ if(_itr) walk.recursive(_itr,null,visitor)}
    },
    // XXX: for assertion
    // DO not modify the code inside the function
    CallExpression: (node) => {
      const { visitor, addMutant } = this;
      const { callee, arguments: args } = node;
      console.log("CallExpression",node);
      // Not to mutate the assertion function
      if (callee.type === 'Identifier' && callee.name === '__assert__') {
        return;
      }
      // Recursively mutate the arguments if it is not the assertion function
      walk.recursive(callee, null, visitor);
      for (const arg of args) walk.recursive(arg, null, visitor);
    }
  }
}

/* Inputs for mutation testing of `example/vector.js`
 *
 * (Problem #2) Killing All Mutants (30 points)
 *
 * Please construct inputs generating a test suite for the `example/vector.js`
 * JavaScript file that kills all the generated mutants.
 *
 * The current inputs kills only 7 out of 220 mutants.
 */
export const vectorInputs: [string][] = [
  ["$V([1, 2, 3]).dup()"],
  ["$V([1, 2, 3]).distanceFrom($V([3, 2, 1]))"],
  ["$V([1, 2, 3]).e(1)"],
  ["$V([1, 2, 3]).e(3)"],
  ["$V([1, 2, 3]).e(4)"],
  ["$V([1, 2, 3]).dimensions()"],
  ["$V([1, 2, 3]).modulus()"],
  ["$V([1, 2, 3]).eql()"],
  ["$V([1,2]).eql({'elements':'','length':2, '0':1 , '1':2})"],
  ["$V([1,2]).eql({'length':[2], '0':1 , '1':2})"], 
  ["$V([1,2]).eql({'length': 0, '0':1, '1':2})"], 
  ["$V([1,2]).eql($V([3,2]))"], 
  ["$V([1,'2']).eql($V([1,2]))"], 
  ["$V([1,2]).angleFrom({'elements':'','length':2, '0':1 , '1':2})"],
  ["$V([1,2]).angleFrom({'length':'2', '0':1 , '1':2})"],
  ["$V([1,2]).isParallelTo({'length':0,'0':1,'1':2})"],
  ["new Vector().isParallelTo.call({'angleFrom': function(){return [0] }},$V([3,2,1]))"],
  ["$V([1,2]).isAntiparallelTo()"],
  ["$V([1,2]).isAntiparallelTo({'length':0,'0':1,'1':2})"],
  ["$V([-1]).isAntiparallelTo($V([-1]))"],
  ["new Vector().isAntiparallelTo.call({'angleFrom': function(){return (+Math.PI).toString() }},$V([3,2,1]))"],
  ["$V([1,2]).isPerpendicularTo({'length':0,'0':1,'1':2})"],
  ["new Vector().isPerpendicularTo.call({'dot': function(){return [0] }},$V([3,2,1]))"],
  ["$V([1,2]).add()"],
  ["$V([1,2]).add({'length':0,'0':1,'1':2})"],
  ["$V([1,2]).add({'length':'2','0':1,'1':2})"],
  ["$V([1,2]).add({'elements':'','length':2, '0':1 , '1':2})"],
  ["$V([1,2]).subtract()"],
  ["$V([1,2]).subtract({'elements':'','length':'2', '0':1 , '1':2})"],
  ["$V([1,2]).subtract({'elements':'','length':3, '0':1 , '1':2})"],
  ["$V([1,2]).multiply(3)"],
  ["$V([1,2]).dot()"],
  ["$V([1,2]).dot({'elements':'','length':'2', '0':1 , '1':2})"],
  ["$V([1,2]).cross()"],
  ["$V([1,2]).cross({'elements':'','length':'2', '0':1, '1':2})"], 
  ["$V([1,2,3]).cross({'elements':'','length':'2', '0':1, '1':2,'2':3})"], 
  ["$V([1,2,3]).cross({'elements':'','length':'3', '0':1, '1':2,'2':3})"],
  ["new Vector().cross.call({'elements' : {'length':[3], '0':1, '1':2,'2':3}},$V([3,2,1]))"],
  ["$V([1,2]).max()"],
  ["$V([9,'9.0','f']).max()"],
  ["$V([1, 2, 3]).indexOf('2')"],
  ["$V([1, 2, 3]).indexOf(4)"],
  ["$V([1,2]).distanceFrom({'elements':'','length':3, '0':1 , '1':2})"],
  ["$V([1,2]).distanceFrom({'anchor':1})"],
  ["$V([1,2]).distanceFrom({'elements':'','length':'2', '0':1 , '1':2})"],
  ["$V([1,2]).inspection()"],
  ["$V({'elements':''})"]

]