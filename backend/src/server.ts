import express from 'express';
import cookieParser from 'cookie-parser';
import { SessionService } from './auth/session.service';
import { SamlService } from './saml/saml.service';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const PORT = 3000;

const samlService = new SamlService();
const sessionService = new SessionService();

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

const user = {
  id: result.profile.nameID,
  email:
    typeof result.profile.emailaddress === 'string'
      ? result.profile.emailaddress
      : undefined,
  name:
    typeof result.profile.name === 'string'
      ? result.profile.name
      : undefined,
};

    const sessionId = sessionService.createSession(user);

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      message: 'SAML authentication successful',
      user,
    });
  } catch (error) {
    console.error('SAML validation failed:', error);

    return res.status(401).json({
      error: 'SAML response validation failed',
    });
  }
});

app.get('/auth/me', (req, res) => {
  const sessionId = req.cookies.session_id;

  if (!sessionId) {
    return res.status(401).json({
      error: 'Not authenticated',
    });
  }

  const user = sessionService.getSession(sessionId);

  if (!user) {
    return res.status(401).json({
      error: 'Session expired or invalid',
    });
  }

  return res.json({
    user,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});