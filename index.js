const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const gm = require('gm').subClass({ imageMagick: true });
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static files from /public
app.use(express.static('public'));

// ✅ Serve template images from /public/templates via /templates
app.use('/templates', express.static(path.join(__dirname, 'public/templates')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ImageMagick API is live' });
});

// List templates
app.get('/templates', (req, res) => {
  const templateDir = path.join(__dirname, 'templates');
  fs.readdir(templateDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Template directory not found' });
    const templates = files
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
    res.json({ templates });
  });
});

// Simple test image generation
app.post('/generate', (req, res) => {
  const { title, subtitle } = req.body;

  const fontBold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const fontRegular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

  gm(1200, 630, '#ffffff')
    .font(fontBold, 60)
    .fill('#333')
    .drawText(50, 150, title || 'Untitled')
    .font(fontRegular, 30)
    .drawText(50, 250, subtitle || '')
    .toBuffer('PNG', (err, buffer) => {
      if (err) return res.status(500).send(err.message);
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    });
});

// Generate image using a blog overlay template
app.post('/generate-overlay', (req, res) => {
  const { title, excerpt, category, author, date, template = 'default' } = req.body;
  const templatePath = path.join(__dirname, 'templates', `${template}.json`);
  const fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  let image;

  // ✅ Handle background as either a color or an image file
  if (
    templateData.background.endsWith('.png') ||
    templateData.background.endsWith('.jpg') ||
    templateData.background.endsWith('.jpeg')
  ) {
    // Use the image file from public/templates
    image = gm(path.join(__dirname, 'public', templateData.background));
  } else {
    // Use background as solid color
    image = gm(templateData.width, templateData.height, templateData.background);
  }

  image
    .font(fontPath, 48)
    .fill(templateData.titleColor)
    .drawText(templateData.titleX, templateData.titleY, title || '')
    .font(fontPath, 28)
    .fill(templateData.excerptColor)
    .drawText(templateData.excerptX, templateData.excerptY, excerpt || '')
    .font(fontPath, 22)
    .fill(templateData.metaColor)
    .drawText(
      templateData.metaX,
      templateData.metaY,
      `${author || ''} | ${category || ''} | ${date || ''}`
    );

  image.toBuffer('PNG', (err, buffer) => {
    if (err) return res.status(500).send(err.message);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`ImageMagick API running on port ${PORT}`);
});
