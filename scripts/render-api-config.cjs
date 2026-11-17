#!/usr/bin/env node
const fs = require('node:fs');

function renderConfig(manifest, current, override) {
    // An unset repository variable preserves operator activation; only bootstrap defaults to false.
    const explicit = override?.trim();
    const enabled = explicit || current?.data?.SAGA_ENABLED || manifest.data.SAGA_ENABLED;
    if (enabled !== 'true' && enabled !== 'false') throw new Error('SAGA_ENABLED must be true or false.');
    return { ...manifest, data: { ...manifest.data, SAGA_ENABLED: enabled } };
}

if (require.main === module) {
    try {
        const manifest = JSON.parse(fs.readFileSync(0, 'utf8'));
        const previous = fs.readFileSync(process.argv[2], 'utf8').trim();
        const current = previous ? JSON.parse(previous) : undefined;
        process.stdout.write(JSON.stringify(renderConfig(manifest, current, process.env.SAGA_ENABLED)));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
module.exports = { renderConfig };
