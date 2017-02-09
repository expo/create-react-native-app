// @flow

import chalk from 'chalk';
import { createPatch } from 'diff';
// NOTE: this is an undocumented API and liable to break after upgrading jscodeshift
import j from 'jscodeshift/dist/core';

function generatePatchesForMainForEject(mainPath: string, mainSource: string, transformedSource: string): string {

  const patch = createPatch(mainPath, mainSource, transformedSource);

  let coloredPatch = '';

  for (let l of patch.split('\n')) {
    if (l.startsWith('-')) {
      coloredPatch += chalk.red(l) + '\n';
    } else if (l.startsWith('+')) {
      coloredPatch += chalk.green(l) + '\n';
    } else {
      coloredPatch += l + '\n';
    }
  }

  return coloredPatch;
}

function transformMainForEject(mainSource: string, moduleName: string): string {
  const ast = j(mainSource);

  let foundReactNativeImport = false;
  let rootClassId = null;

  // remove the Exponent.registerRootComponent call, and also record the name of the root component
  ast.find(j.ExpressionStatement)
  .filter(e => e.value.expression.callee.object.name === 'Exponent')
  .filter(e => e.value.expression.callee.property.name === 'registerRootComponent')
  .forEach(e => {
    rootClassId = j.identifier(e.value.expression.arguments[0].name);
    e.prune();
  });

  // add the vanilla react native appregistry command
  if (!rootClassId) {
    throw new Error('Unable to find an invocation of `Exponent.registerRootComponent` to transform.');
  }

  const reactNativeAppRegistryInvocation =
    j.expressionStatement(
      j.callExpression(
        j.memberExpression(
          j.identifier('AppRegistry'),
          j.identifier('registerComponent')), [j.literal(moduleName), j.arrowFunctionExpression([], rootClassId)]));

  ast.find(j.Program).forEach(p => p.value.body.push(reactNativeAppRegistryInvocation));

  // add appregistry to existing react-native imports if they exist (how could they not?)
  const appRegistryImport = j.importSpecifier(j.identifier('AppRegistry'));
  ast.find(j.ImportDeclaration)
  .filter(i => i.value.source.value === 'react-native')
  .forEach(i => {
    // TODO check to see if appregistry is in the imports before doing any of this
    i.value.specifiers.push(appRegistryImport);

    // people might gripe about sorting these, but in dikaiosune's opinion it's better than
    // sticking a guaranteed-out-of-order import at the end
    i.value.specifiers.sort((a, b) => a.imported.name > b.imported.name);

    foundReactNativeImport = true;
  });

  // handle case where there's no react-native imports
  if (!foundReactNativeImport) {
    // lol how did you even build this app?
    const newImport = j.importDeclaration([appRegistryImport], j.literal('react-native'));
    ast.find(j.Program).forEach(p => p.value.body.splice(0, 0, newImport));
  }

  // clear exponent import
  ast.find(j.ImportDeclaration)
  .filter(i => i.value.source.value === 'exponent')
  .forEach(i => i.prune());

  return ast.toSource({
    quote: 'single'
  });
}

export {
  transformMainForEject, generatePatchesForMainForEject
}
