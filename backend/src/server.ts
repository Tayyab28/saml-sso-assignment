import express from 'express';
import { SamlService } from './saml/saml.service';

const app = express();
const PORT = 3000;

const samlService = new SamlService();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/auth/saml/metadata', (_req, res) => {
  res
    .type('application/xml')
    .send(samlService.getMetadata());
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});