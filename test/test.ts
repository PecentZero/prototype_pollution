import assert from 'assert';

import {
  readFile,
  readJSON,
  TodoError,
} from '../src/helper';

import {
  KillCounter,
  MutantType,
  MutationScore,
  MutationTester,
} from '../src/tester';

import {
  Mutator,
  vectorInputs,
} from '../src/impl';

const {
  Arithmetic,
  ArrayDecl,
  AssignExpr,
  BlockStmt,
  BooleanLiteral,
  Cond,
  EqualityOp,
  LogicalOp,
  ObjectLiteral,
  OptionalChain,
  StringLiteral,
  UnaryOp,
  Update,
} = MutantType;


const expectedCVEMaps = ["CVE-2021-20084","CVE-2021-20086","CVE-2021-20087","CVE-2021-20088"];

function readInputs(name: string) {
  return readJSON(`input/${name}.json`);
}

function getScore(target: string, inputs: any[][], detail: boolean = false) {
  const code = readFile(`example/${target}.js`);
  const tester = new MutationTester(code, detail);
  return tester.run(inputs);
}

function getScoreCVE(target: string, detail: boolean = false) {
  const code = readFile(`example/${target}.js`);
  const tester = new MutationTester(code, detail);
  //return tester.run(inputs);
}




function check(target: string) {
  describe(`${target}.js`, () => {
    const expectedMap = expectedMaps[target];
    for (const name in expectedMap) {
      it(`should return the correct mutation score for ${name}.json`, () => {
        try {
          const counter = new Map(expectedMap[name]);
          const expected = MutationScore.fromCounters(counter);
          const score = getScore(target, readInputs(name));
          assert.equal(expected.toString(), score.toString());
        } catch(e) {
          if (typeof e === 'string') assert.fail(e);
          else throw e;
        }
      })
    }
  });
}

function checkCVE(target: string) {
  describe(`${target}.js`, () => {
    //const expectedMap = expectedMaps[target];
    //for (const name in expectedMap) {
      it(`should return the correct mutation score for ${target}.json`, () => {
        try {
          //const counter = new Map(expectedMap[name]);
          //const expected = MutationScore.fromCounters(counter);
          getScoreCVE(target);
          //assert.equal(expected.toString(), score.toString());
        } catch(e) {
          if (typeof e === 'string') assert.fail(e);
          else throw e;
        }
      })
    //}
  });
}



describe('Prototype Pollution testing', () => {
  for (const target in expectedCVEMaps) {
    {
      console.log(expectedCVEMaps[target]);
      checkCVE(expectedCVEMaps[target]);
    }
  }
});



/*
describe('mutation testing', () => {
  for (const target in expectedMaps) {
    //check(target);
  }
});

describe('vectorInputs', () => {
  it(`should have the perfect mutation score for vector.js`, () => {
    const { killed, total } = getScore('vector', vectorInputs);
    assert.equal(killed, total);
  })
});
*/