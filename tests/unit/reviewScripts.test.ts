import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const { checkArchitecture } = require('../../scripts/check-architecture.cjs');
const { runScanner } = require('../../scripts/run-sonar.cjs');
const { renderConfig } = require('../../scripts/render-api-config.cjs');

describe('architecture dependency detection', () => {
    let root: string;
    beforeEach(() => {
        root = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-review-'));
        fs.mkdirSync(path.join(root, 'src/enterprise'), { recursive: true });
    });
    afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
    function check(text: string) {
        fs.writeFileSync(path.join(root, 'src/enterprise/example.ts'), text);
        return checkArchitecture([root]);
    }
    test('ignores dependency examples in comments and string literals', () => {
        expect(check(`// Do not import 'mongodb' here.
/* import driver from 'pg'; require('express'); */
const example = "import driver from 'mongoose'";
const description = \`require('nodemailer')\`;
export const harmless = true;`)).toEqual([]);
    });
    test.each([
        "import { MongoClient } from 'mongodb';",
        "const driver = require('pg');",
        "export { Router } from 'express';",
        "import driver = require('mongoose');",
        "const driver = import('amqplib');",
        "type Driver = import('mongodb').MongoClient;",
        "import driver from 'mongodb/lib/client';",
        "import { db } from '../infrastructure/database';",
    ])('rejects a real prohibited dependency: %s', source => {
        expect(check(source)).toHaveLength(1);
    });
});

describe('Sonar scanner launcher', () => {
    test('preserves scanner arguments without invoking a shell', () => {
        const env = { SONAR_TOKEN: 'token with spaces $(not-a-command) `literal`' };
        const spawn = jest.fn().mockReturnValue({ status: 7 });
        expect(runScanner(env, spawn)).toBe(7);
        expect(spawn).toHaveBeenCalledWith('npx', [
            'sonar-scanner', `-Dsonar.token=${env.SONAR_TOKEN}`, `-Dsonar.login=${env.SONAR_TOKEN}`,
        ], { stdio: 'inherit', shell: false, env });
    });
    test.each([{ status: 0 }, { status: 3 }, { status: null, signal: 'SIGTERM' }])('propagates scanner exit status: %p', result => {
        expect(runScanner({ SONAR_TOKEN: 'test' }, () => result)).toBe(result.status ?? 1);
    });
    test('fails when the scanner cannot start and skips when the token is absent', () => {
        const stderr = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(runScanner({ SONAR_TOKEN: 'test' }, () => ({ error: new Error('ENOENT'), status: null }))).toBe(1);
        const spawn = jest.fn();
        expect(runScanner({}, spawn)).toBe(0);
        expect(spawn).not.toHaveBeenCalled();
        stderr.mockRestore();
    });
});

describe('Saga deployment activation', () => {
    const manifest = { kind: 'ConfigMap', data: { SAGA_ENABLED: 'false', PORT: '3000' } };
    test('bootstraps disabled but preserves activation over repeated deployments', () => {
        expect(renderConfig(manifest, undefined, '').data.SAGA_ENABLED).toBe('false');
        const enabled = { data: { SAGA_ENABLED: 'true' } };
        const deployed = renderConfig(manifest, enabled, '');
        expect(deployed.data).toEqual({ SAGA_ENABLED: 'true', PORT: '3000' });
        expect(renderConfig(manifest, deployed, undefined).data.SAGA_ENABLED).toBe('true');
    });
    test('honors an explicit deployment variable, including deliberate deactivation', () => {
        expect(renderConfig(manifest, undefined, 'true').data.SAGA_ENABLED).toBe('true');
        expect(renderConfig(manifest, { data: { SAGA_ENABLED: 'true' } }, 'false').data.SAGA_ENABLED).toBe('false');
    });
    test('rejects invalid activation values instead of silently disabling Saga', () => {
        expect(() => renderConfig(manifest, undefined, 'yes')).toThrow('true or false');
        expect(() => renderConfig(manifest, { data: { SAGA_ENABLED: 'invalid' } }, '')).toThrow('true or false');
    });
});
