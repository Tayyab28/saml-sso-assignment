import express from 'express';
import cookieParser from 'cookie-parser';

import { SamlService } from './saml/saml.service';
import { SessionService } from './auth/session.service';
import { AssertionReplayStore } from './saml/assertion-replay.store';

const app = express();
const PORT = 3000;

const samlService = new SamlService();
const sessionService = new SessionService();
const assertionReplayStore = new AssertionReplayStore();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/auth/saml/metadata', (_req, res) => {
  res
    .type('application/xml')
    .send(samlService.getMetadata());
});

app.get('/auth/saml/login', async (_req, res) => {
  try {
    const loginUrl = await samlService.getLoginUrl();

    return res.redirect(loginUrl);
  } catch (error) {
    console.error('Failed to generate SAML login URL:', error);

    return res.status(500).json({
      error: 'Unable to start SAML login',
    });
  }
});

app.post('/auth/saml/callback', async (req, res) => {
  try {
    const result = await samlService.validatePostResponse(req.body);

    if (!result.profile) {
  return res.status(401).json({
    error: 'SAML authentication failed',
  });
}

    const assertionId = samlService.getAssertionId(result);

if (!assertionId) {
  return res.status(401).json({
    error: 'SAML assertion ID is missing',
  });
}
 
   if (assertionReplayStore.hasBeenConsumed(assertionId)) {
      return res.status(401).json({
        error: 'SAML assertion has already been used',
     });
    }

// Extract identity...
const attributes =
  typeof result.profile.attributes === 'object' &&
  result.profile.attributes !== null
    ? result.profile.attributes as Record<string, unknown>
    : {};

    const emailClaim =
      attributes[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ];

    const nameClaim =
      attributes[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ];

    const user = {
      id: result.profile.nameID,

      email:
        typeof emailClaim === 'string'
          ? emailClaim
          : undefined,

      name:
        typeof nameClaim === 'string'
          ? nameClaim
          : undefined,
    };

    assertionReplayStore.consume(
  assertionId,
  Date.now() + 5 * 60 * 1000,
);

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