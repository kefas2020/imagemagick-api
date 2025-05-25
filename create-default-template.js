const fs = require('fs');
const path = require('path');

const template = {
  name: 'default',
  width: 1200,
  height: 630,
  background: '#ffffff',
  titleColor: '#111111',
  titleX: 50,
  titleY: 150,
  excerptColor: '#333333',
  excerptX: 50,
  excerptY: 250,
  metaColor: '#555555',
  metaX: 50,
  metaY: 350
};

const templatesDir = path.join(__dirname, 'templates');

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir);
}

fs.writeFileSync(path.join(templatesDir, 'default.json'), JSON.stringify(template, null, 2));
console.log('✅ Default template created.');
