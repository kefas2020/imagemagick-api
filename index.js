const express = require('express');
const gm = require('gm').subClass({ imageMagick: true });
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/generate', (req, res) => {
  const { title, subtitle } = req.body;

  gm(1200, 630, '#ffffff')
    .fill('#333')
    .fontSize(60)
    .drawText(50, 150, title || 'Untitled')
    .fontSize(30)
    .drawText(50, 250, subtitle || '')
    .toBuffer('PNG', (err, buffer) => {
      if (err) return res.status(500).send(err.message);
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Overlay service running on port ${PORT}`));