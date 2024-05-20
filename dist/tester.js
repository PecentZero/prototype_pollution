"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutationScore = exports.MutationTester = exports.allMutantTypes = exports.MutantType = exports.Mutant = void 0;
const helper_1 = require("./helper");
const impl_1 = require("./impl");
const chalk_1 = require("chalk");
const dedent_js_1 = __importDefault(require("dedent-js"));
class Mutant {
    constructor(id, type, code, orig, range, after) {
        this.toString = () => {
            const { id, type, orig, range, after } = this;
            const { start, end } = range;
            let before = (0, dedent_js_1.default)(orig.substring(start.index, end.index));
            const MAX_LEN = 50;
            if (before.length > MAX_LEN)
                switch (type) {
                    case MutantType.BlockStmt:
                    case MutantType.ObjectLiteral:
                        before = '{ ... }';
                        break;
                }
            return `Mutant #${id} [${type}] [${range}] \`${before}\` -> \`${after}\``;
        };
        this.id = id;
        this.type = type;
        this.code = code;
        this.runner = (0, helper_1.getRunner)(code);
        this.orig = orig;
        this.range = range;
        this.after = after;
    }
}
exports.Mutant = Mutant;
var MutantType;
(function (MutantType) {
    MutantType["Arithmetic"] = "arith";
    MutantType["ArrayDecl"] = "array";
    MutantType["AssignExpr"] = "assign";
    MutantType["BlockStmt"] = "block";
    MutantType["BooleanLiteral"] = "bool";
    MutantType["Cond"] = "cond";
    MutantType["EqualityOp"] = "equal";
    MutantType["LogicalOp"] = "logical";
    MutantType["ObjectLiteral"] = "object";
    MutantType["OptionalChain"] = "opt-chain";
    MutantType["StringLiteral"] = "string";
    MutantType["UnaryOp"] = "unary";
    MutantType["Update"] = "update";
})(MutantType || (exports.MutantType = MutantType = {}));
exports.allMutantTypes = Object.values(MutantType).sort();
class MutationTester {
    constructor(code, detail = false) {
        this.run = (inputs) => {
            const { mutants, runner, isKilled, detail } = this;
            const score = new MutationScore(mutants);
            const tests = inputs.map(input => ({ input, expected: runner(input) }));
            if (detail) {
                (0, helper_1.header)('Test cases inferred from the inputs');
                for (let i = 0; i < tests.length; i++) {
                    const test = tests[i];
                    (0, helper_1.log)(`Test #${i + 1}: ${(0, helper_1.getString)(test)}`);
                }
                (0, helper_1.header)('Killed or Alive Mutants');
            }
            for (const mutant of mutants) {
                if (isKilled(mutant, tests)) {
                    score.add(mutant);
                }
            }
            return score;
        };
        this.isKilled = (mutant, tests) => {
            const { detail } = this;
            for (const test of tests) {
                const { input, expected } = test;
                const result = mutant.runner(input);
                const killed = result != expected;
                if (killed) {
                    if (detail) {
                        (0, helper_1.log)(`[KILLED] ${mutant}`, chalk_1.green);
                        (0, helper_1.log)(`         Test is ${(0, helper_1.getString)(test)} but got ${(0, helper_1.getString)(result)}`);
                    }
                    return true;
                }
            }
            if (detail)
                (0, helper_1.log)(`[ALIVE ] ${mutant}`, chalk_1.red);
            return false;
        };
        this.code = code;
        this.runner = (0, helper_1.getRunner)(code);
        this.mutants = impl_1.Mutator.from(code, detail);
        this.detail = detail;
    }
}
exports.MutationTester = MutationTester;
class MutationScore {
    constructor(mutants) {
        this.equals = (that) => {
            for (const type of exports.allMutantTypes) {
                const thisCounter = this.getCounter(type);
                const thatCounter = that.getCounter(type);
                if (thisCounter.killed != thatCounter.killed)
                    return false;
                if (thisCounter.total != thatCounter.total)
                    return false;
            }
            return true;
        };
        this.add = (mutant) => {
            this.killed++;
            this.getCounter(mutant.type).killed++;
        };
        this.toString = (detail = true) => {
            const { killed, total } = this;
            const ratio = (killed / total) * 100;
            let str = `${killed} / ${total} (${ratio.toFixed(2)}%)`;
            if (detail)
                for (const type of exports.allMutantTypes) {
                    const counter = this.getCounter(type);
                    if (counter.total > 0) {
                        const { killed, total } = counter;
                        const ratio = (killed / total) * 100;
                        const typeStr = type.padEnd(10);
                        const killedStr = killed.toString().padStart(3);
                        const totalStr = total.toString().padStart(3);
                        str += `\n  [${typeStr}]: ${killedStr} / ${totalStr}`;
                    }
                }
            return str;
        };
        this.counters = new Map();
        this.killed = 0;
        this.total = 0;
        for (const mutant of mutants) {
            const counter = this.getCounter(mutant.type);
            counter.total++;
            this.total++;
        }
    }
    getCounter(type) {
        let counter = this.counters.get(type);
        if (!counter) {
            counter = { killed: 0, total: 0 };
            this.counters.set(type, counter);
        }
        return counter;
    }
}
exports.MutationScore = MutationScore;
MutationScore.fromCounters = (counters) => {
    const score = new MutationScore([]);
    score.counters = counters;
    for (const counter of counters.values()) {
        score.killed += counter.killed;
        score.total += counter.total;
    }
    return score;
};
