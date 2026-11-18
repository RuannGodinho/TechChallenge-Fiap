#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const databaseDrivers = new Set(['pg', 'mongodb', 'mongoose']);
const transportLibraries = new Set(['express', 'amqplib', 'nodemailer', 'jsonwebtoken']);

function files(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : entry.name.endsWith('.ts') ? [path.join(dir, entry.name)] : []);
}

function dependencies(source) {
    const imports = [];
    const add = node => {
        if (node && ts.isStringLiteralLike(node)) imports.push(node);
    };
    const visit = node => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier);
        else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) add(node.moduleReference.expression);
        else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal);
        else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
            || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) add(node.arguments[0]);
        ts.forEachChild(node, visit);
    };
    visit(source);
    return imports;
}

function checkArchitecture(roots) {
    const violations = [];
    for (const rootArg of roots) {
        const root = path.resolve(rootArg);
        for (const layer of ['enterprise', 'application', 'Adapters/controllers']) {
            for (const file of files(path.join(root, 'src', layer))) {
                const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
                for (const node of dependencies(source)) {
                    const target = node.text;
                    const resolved = target.startsWith('.') ? path.resolve(path.dirname(file), target) : target;
                    const controller = layer === 'Adapters/controllers';
                    const outward = target.startsWith('.') && (resolved.includes(path.sep + 'infrastructure' + path.sep)
                        || (!controller && (resolved.includes(path.sep + 'Adapters' + path.sep) || resolved.includes(path.sep + 'validators' + path.sep))));
                    const library = target.split('/')[0];
                    const framework = databaseDrivers.has(library) || (!controller && transportLibraries.has(library));
                    if (outward || framework) {
                        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
                        violations.push(`${path.relative(root, file)}:${line}: ${layer} depends on ${target}`);
                    }
                }
            }
        }
    }
    return violations;
}

if (require.main === module) {
    const roots = process.argv.length > 2 ? process.argv.slice(2) : [process.cwd()];
    const violations = checkArchitecture(roots);
    for (const root of roots) console.log(`Checked domain, application and controllers: ${path.resolve(root)}`);
    if (violations.length) {
        console.error(violations.join('\n'));
        process.exitCode = 1;
    } else console.log('Architecture dependency checks passed.');
}
module.exports = { checkArchitecture };
