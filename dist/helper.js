"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplateElement = exports.createBoolLiteral = exports.getRunner = exports.Range = exports.Cursor = exports.inputValidCheck = exports.parse = exports.todo = exports.err = exports.warn = exports.header = exports.log = exports.BAR = exports.getString = exports.readJSON = exports.getArgs = exports.writeFile = exports.readFile = exports.scriptName = void 0;
const chalk_1 = require("chalk");
const object_inspect_1 = __importDefault(require("object-inspect"));
const acorn_1 = __importDefault(require("acorn"));
const fs_1 = __importDefault(require("fs"));
const dedent_js_1 = __importDefault(require("dedent-js"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["LOG"] = 0] = "LOG";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
})(LogLevel || (LogLevel = {}));
exports.scriptName = 'js-mutest';
function readFile(path) {
    if (!fs_1.default.existsSync(path))
        err(`File not found: \`${path}\`.`);
    return fs_1.default.readFileSync(path, 'utf-8').toString().trim();
}
exports.readFile = readFile;
function writeFile(path, content) {
    fs_1.default.writeFileSync(path, content);
}
exports.writeFile = writeFile;
function getArgs(cmd, argv, expected) {
    if (argv._.length - 1 != expected) {
        err(`Exactly ${expected} arguments are required for \`${cmd}\`.`);
    }
    return argv._.slice(1);
}
exports.getArgs = getArgs;
function readJSON(path) {
    return JSON.parse(readFile(path));
}
exports.readJSON = readJSON;
function getString(value) {
    if (typeof value === 'string')
        return value;
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (value.hasOwnProperty('toString'))
        return value.toString();
    return (0, object_inspect_1.default)(value, { depth: 3 });
}
exports.getString = getString;
exports.BAR = '-'.repeat(80);
function log(value, color = chalk_1.white, level = LogLevel.LOG, header = 'INFO') {
    let print;
    switch (level) {
        case LogLevel.LOG:
            print = console.log;
            break;
        case LogLevel.WARN:
            print = console.warn;
            break;
        case LogLevel.ERROR:
            print = (msg) => { throw msg; };
            break;
    }
    const msg = color(`[${header.padEnd(5, ' ')}] ${getString(value)}`);
    if (level === LogLevel.ERROR)
        throw msg;
    print(msg);
}
exports.log = log;
function header(msg) {
    log(exports.BAR);
    log(msg);
    log(exports.BAR);
}
exports.header = header;
function warn(value) {
    log(value, chalk_1.yellow, LogLevel.WARN, 'WARN');
}
exports.warn = warn;
function err(value) {
    log(value, chalk_1.red, LogLevel.ERROR, 'ERROR');
}
exports.err = err;
function todo(msg = '') {
    log(msg, chalk_1.red, LogLevel.ERROR, 'TODO');
}
exports.todo = todo;
function parse(code) {
    return acorn_1.default.parse(code, { ecmaVersion: 2023 });
}
exports.parse = parse;
function inputValidCheck(inputs) {
    if (!Array.isArray(inputs)) {
        err('Input set must be an array.');
    }
    else {
        inputs.forEach(input => {
            if (!Array.isArray(input)) {
                err(`Input must be an array -- ${getString(input)}`);
            }
        });
    }
}
exports.inputValidCheck = inputValidCheck;
class Cursor {
    constructor(code, index) {
        this.toString = () => `${this.line}:${this.col}`;
        const lines = code.substring(0, index).split('\n');
        this.index = index;
        this.line = lines.length;
        this.col = index - lines.slice(0, -1).join('\n').length;
    }
}
exports.Cursor = Cursor;
class Range {
    constructor(start, end) {
        this.toString = () => `${this.start.toString()}-${this.end.toString()}`;
        this.start = start;
        this.end = end;
    }
    static fromCode(code, start, end) {
        return new Range(new Cursor(code, start), new Cursor(code, end));
    }
    static fromNode(code, node) {
        return Range.fromCode(code, node.start, node.end);
    }
}
exports.Range = Range;
function getRunner(code) {
    return eval((0, dedent_js_1.default)(`(() => {
    function __assert__(condition) {
      if (!condition) throw 'Assertion failed';
    }
    const orig = (${code});
    return function (args) {
      try {
        return getString(orig(...args));
      } catch (e) {
        return e.toString();
      }
    }
  })()`));
}
exports.getRunner = getRunner;
function createBoolLiteral(value) {
    return {
        type: 'Literal',
        value,
        raw: value.toString(),
        start: 0,
        end: 0,
    };
}
exports.createBoolLiteral = createBoolLiteral;
function createTemplateElement(value) {
    return {
        type: 'TemplateElement',
        start: 0,
        end: 0,
        value: {
            raw: value,
            cooked: value,
        },
        tail: true,
    };
}
exports.createTemplateElement = createTemplateElement;
