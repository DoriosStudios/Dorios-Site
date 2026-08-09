#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {parse} from '@babel/parser';

const [sourceFile, outputFile] = process.argv.slice(2);
if (!sourceFile || !outputFile) {
  throw new Error('Usage: node extract_trinket_profiles.mjs <register.js> <profiles.json>');
}

const ast = parse(fs.readFileSync(sourceFile, 'utf8'), {sourceType: 'module'});

function propertyName(node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral') return String(node.value);
  return null;
}

function literal(node) {
  if (!node) return undefined;
  if (['StringLiteral', 'NumericLiteral', 'BooleanLiteral'].includes(node.type)) return node.value;
  if (node.type === 'NullLiteral') return null;
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'NumericLiteral') return -node.argument.value;
  if (node.type === 'ArrayExpression') return node.elements.map(literal).filter((value) => value !== undefined);
  if (node.type !== 'ObjectExpression') return undefined;
  const value = {};
  node.properties.forEach((property) => {
    if (property.type !== 'ObjectProperty') return;
    const key = propertyName(property.key);
    const child = literal(property.value);
    if (key !== null && child !== undefined) value[key] = child;
  });
  return value;
}

let trinketNode;
for (const statement of ast.program.body) {
  if (statement.type !== 'VariableDeclaration') continue;
  const declaration = statement.declarations.find(({id}) => id.type === 'Identifier' && id.name === 'trinkets');
  if (declaration) trinketNode = declaration.init;
}
if (!trinketNode || trinketNode.type !== 'ObjectExpression') throw new Error('Could not find the trinkets registry');

const groups = literal(trinketNode);
const profiles = {};
const auxiliaryProfiles = {};
Object.values(groups).forEach((entries) => {
  Object.entries(entries).forEach(([identifier, profile]) => {
    if (identifier.endsWith('_tag')) auxiliaryProfiles[identifier.replace(/_tag$/, '')] = profile;
    else if (profile.trinket) profiles[identifier] = profile;
  });
});

Object.entries(auxiliaryProfiles).forEach(([identifier, auxiliary]) => {
  const profile = profiles[identifier];
  if (!profile) return;
  for (const field of ['stats', 'passives', 'actives']) {
    if (auxiliary[field]) profile[field] = {...(profile[field] ?? {}), ...auxiliary[field]};
  }
  if (auxiliary.immunities) profile.immunities = [...new Set([...(profile.immunities ?? []), ...auxiliary.immunities])];
});

fs.mkdirSync(path.dirname(outputFile), {recursive: true});
fs.writeFileSync(outputFile, `${JSON.stringify(profiles, null, 2)}\n`);
console.log(`Extracted ${Object.keys(profiles).length} trinket profiles.`);
