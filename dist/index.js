"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const yargs_1 = __importDefault(require("yargs"));
const impl_1 = require("./impl");
const tester_1 = require("./tester");
const mutate = (argv) => {
    const [targetPath] = (0, helper_1.getArgs)('mutate', argv, 1);
    const { detail } = argv;
    if (detail)
        (0, helper_1.log)('Generating mutants for the target JS file...');
    const code = (0, helper_1.readFile)(targetPath);
    if (detail)
        (0, helper_1.log)(`The target file is \`${targetPath}\`.`);
    const mutator = new impl_1.Mutator(code, detail);
    for (const mutant of mutator.mutants) {
        console.log(mutant.toString());
    }
};
const test = (argv) => {
    const [targetPath, inputPath] = (0, helper_1.getArgs)('test', argv, 2);
    const { detail } = argv;
    if (detail)
        (0, helper_1.log)('Perform mutation testing with the target JS file...');
    const code = (0, helper_1.readFile)(targetPath);
    if (detail)
        (0, helper_1.log)(`The target file is \`${targetPath}\`.`);
    const inputs = (0, helper_1.readJSON)(inputPath);
    (0, helper_1.inputValidCheck)(inputs);
    if (detail)
        (0, helper_1.log)(`The input file is \`${inputPath}\`.`);
    const tester = new tester_1.MutationTester(code, detail);
    const score = tester.run(inputs);
    console.log(`Mutation score: ${score}`);
};
try {
    (0, yargs_1.default)(process.argv.slice(2))
        .scriptName(helper_1.scriptName)
        .usage('Usage: $0 <command> [options]')
        .command('mutate', 'Generate mutants for the target JS file', () => { }, mutate)
        .example('$0 mutate target.js', 'Generate mutants for the target JS file')
        .command('test', 'Perform mutation testing', () => { }, test)
        .example('$0 test target.js input.json', 'Perform mutation testing')
        .option('detail', {
        type: 'boolean',
        description: 'Show detailed process',
    })
        .demandCommand(1, `You need a command to run \`${helper_1.scriptName}.\``)
        .parse();
}
catch (e) {
    if (typeof e === 'string') {
        console.error(e);
    }
    else {
        throw e;
    }
}
