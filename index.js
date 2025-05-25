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

  // Handle background as either a color or an image file
  if (
    templateData.background.endsWith('.png') ||
    templateData.background.endsWith('.jpg') ||
    templateData.background.endsWith('.jpeg')
  ) {
    // Construct the full path to the background image
    const backgroundImagePath = path.join(__dirname, 'public', templateData.background);
    
    console.log('Looking for background image at:', backgroundImagePath);
    
    // Check if the file exists before trying to use it
    if (!fs.existsSync(backgroundImagePath)) {
      console.error('Background image not found at:', backgroundImagePath);
      return res.status(404).json({ error: `Background image not found: ${templateData.background}` });
    }
    
    image = gm(backgroundImagePath);
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
    if (err) {
      console.error('ImageMagick error:', err);
      return res.status(500).send(err.message);
    }
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  });
});