import express from 'express';
import { SamlService } from './saml/saml.service';

const app = express();
app.use(express.urlencoded({ extended: false }));
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

app.get('/auth/saml/login', async (_req, res) => {
  const loginUrl = await samlService.getLoginUrl();

  res.redirect(loginUrl);
});

app.post('/auth/saml/callback', async (req, res) => {
  try {
    const result = await samlService.validatePostResponse(req.body);

    if (!result.profile) {
      return res.status(401).json({
        error: 'SAML authentication failed',
      });
    }

    return res.json({
      message: 'SAML authentication successful',
      profile: result.profile,
    });
  } catch (error) {
    console.error('SAML validation failed:', error);

    return res.status(401).json({
      error: 'SAML response validation failed',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});