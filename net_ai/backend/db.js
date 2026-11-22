const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
function read(name) {
  const file = path.join(dataDir, name);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
function write(name, value) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, name);
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2));
  fs.renameSync(temp, file);
}
module.exports = { read, write };
