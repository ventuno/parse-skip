const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const types = require('babel-types');
const prettier = require('prettier');

const fnOrigName = 'test';
const fnDestName = 'skip';
const testPkg = 'ember-qunit';

function matchTestName(filter, testName) {
  if (typeof filter === 'string') {
    return testName.indexOf(filter) > -1;
  } else if (filter instanceof RegExp) {
    return filter.test(testName);
  }
}

module.exports = function (source, filter) {
  return prettier.format(source, {
    parser(text, { babylon }) {
      const ast = babylon(text);
      traverse.default(ast, {
        ImportDeclaration(path) {
          const node = path.node;
          const source = node.source;
          if (types.isStringLiteral(source, {value: testPkg})) {
            const specifierExists = node.specifiers.findIndex(specifier => types.isImportSpecifier(specifier) && types.isIdentifier(specifier.local, {name: fnDestName})) > -1;
            if (!specifierExists) {
              const newSpecifier = types.importSpecifier(types.identifier(fnDestName), types.identifier(fnDestName));
              node.specifiers.push(newSpecifier);
            }
          }        
        },
        ExpressionStatement(path) {
          const node = path.node;
          if (
            types.isCallExpression(node.expression) &&
            types.isIdentifier(node.expression.callee, {name: fnOrigName}) &&
            types.isStringLiteral(node.expression.arguments[0]) &&
            matchTestName(filter, node.expression.arguments[0].value)
          ) {
            node.expression.callee = types.identifier(fnDestName);
          }
        },
      });
      return ast;
    },
  });
}
