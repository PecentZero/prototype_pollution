"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorInputs = exports.Mutator = void 0;
const helper_1 = require("./helper");
const tester_1 = require("./tester");
const chalk_1 = require("chalk");
const acorn_walk_1 = __importDefault(require("acorn-walk"));
const astring_1 = require("astring");
class Mutator {
    static from(code, detail = false) {
        const mutator = new Mutator(code, detail);
        return mutator.mutants;
    }
    constructor(code, detail = false) {
        this.generateMutants = () => {
            const { ast, beautified: before, visitor, detail } = this;
            if (detail)
                (0, helper_1.header)('Generating Mutants...');
            acorn_walk_1.default.recursive(ast, null, visitor);
            const after = (0, astring_1.generate)(ast);
            if (before !== after) {
                (0, helper_1.warn)('The AST is changed after generating mutants');
            }
        };
        this.addMutant = (type, node) => {
            const { mutants, code, ast, beautified, detail } = this;
            const id = mutants.length + 1;
            const mutated = (0, astring_1.generate)(ast);
            const range = helper_1.Range.fromNode(code, node);
            const after = (0, astring_1.generate)(node);
            const mutant = new tester_1.Mutant(id, type, mutated, code, range, after);
            mutants.push(mutant);
            if (beautified == mutated) {
                (0, helper_1.warn)('The code is the same after generating a mutant');
                (0, helper_1.warn)(mutant);
            }
            else if (detail) {
                (0, helper_1.log)(mutant, chalk_1.green);
            }
        };
        this.visitor = {
            ArrayExpression: (node) => { (0, helper_1.todo)(); },
            AssignmentExpression: (node) => { (0, helper_1.todo)(); },
            BinaryExpression: (node) => { (0, helper_1.todo)(); },
            BlockStatement: (node) => { (0, helper_1.todo)(); },
            ChainExpression: (node) => { (0, helper_1.todo)(); },
            ConditionalExpression: (node) => { (0, helper_1.todo)(); },
            DoWhileStatement: (node) => { (0, helper_1.todo)(); },
            ForStatement: (node) => { (0, helper_1.todo)(); },
            IfStatement: (node) => { (0, helper_1.todo)(); },
            Literal: (node) => { (0, helper_1.todo)(); },
            LogicalExpression: (node) => { (0, helper_1.todo)(); },
            NewExpression: (node) => { (0, helper_1.todo)(); },
            ObjectExpression: (node) => { (0, helper_1.todo)(); },
            TemplateLiteral: (node) => { (0, helper_1.todo)(); },
            UnaryExpression: (node) => {
                const { visitor, addMutant } = this;
                const { argument, operator } = node;
                switch (operator) {
                    case '+':
                        node.operator = '-';
                        addMutant(tester_1.MutantType.UnaryOp, node);
                        node.operator = operator;
                        break;
                    case '-':
                        node.operator = '+';
                        addMutant(tester_1.MutantType.UnaryOp, node);
                        node.operator = operator;
                        break;
                }
                acorn_walk_1.default.recursive(argument, null, visitor);
            },
            UpdateExpression: (node) => { (0, helper_1.todo)(); },
            WhileStatement: (node) => { (0, helper_1.todo)(); },
            CallExpression: (node) => {
                const { visitor, addMutant } = this;
                const { callee, arguments: args } = node;
                if (callee.type === 'Identifier' && callee.name === '__assert__') {
                    return;
                }
                acorn_walk_1.default.recursive(callee, null, visitor);
                for (const arg of args)
                    acorn_walk_1.default.recursive(arg, null, visitor);
            }
        };
        this.code = code;
        this.mutants = [];
        this.ast = (0, helper_1.parse)(this.code);
        this.beautified = (0, astring_1.generate)(this.ast);
        this.detail = detail;
        this.generateMutants();
    }
}
exports.Mutator = Mutator;
exports.vectorInputs = [
    ["$V([])"],
    ["$V([1, 2, 3]).dup()"],
];
