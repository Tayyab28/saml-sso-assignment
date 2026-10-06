import 'dotenv/config';

export const samlConfig = {
  issuer: process.env.SAML_ISSUER ?? '',
  callbackUrl: process.env.SAML_CALLBACK_URL ?? '',
  entryPoint: process.env.SAML_ENTRY_POINT ?? '',
  idpCert: process.env.SAML_IDP_CERT ?? '',
};