const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const networkName = config.network.name;

const dirPath = path.join(__dirname, '..', 'deployments', networkName);

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const sourceDir = path.join(__dirname, 'protocol-deployment-scripts');
const destDir = path.join(dirPath, 'usdc');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(sourceDir).forEach(file => {
  fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
});