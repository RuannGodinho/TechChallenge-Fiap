const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const lambdaDir = path.resolve(__dirname, '../../../lambda/auth');
const jsonwebtokenMarker = path.join(lambdaDir, 'node_modules/jsonwebtoken/package.json');

try {
  execSync('npm ci --omit=dev', { cwd: lambdaDir, stdio: 'inherit' });
} catch (error) {
  process.stderr.write(`${error}\n`);
  process.exit(1);
}

if (!fs.existsSync(jsonwebtokenMarker)) {
  process.stderr.write('jsonwebtoken was not installed under lambda/auth/node_modules\n');
  process.exit(1);
}

process.stdout.write(JSON.stringify({ prepared: 'true' }));
