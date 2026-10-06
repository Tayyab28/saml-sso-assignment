import { SAML } from '@node-saml/node-saml';
import { samlConfig } from './saml.config';

export class SamlService {
  private readonly saml: SAML;

  constructor() {
    this.saml = new SAML({
      issuer: samlConfig.issuer,
      callbackUrl: samlConfig.callbackUrl,
      entryPoint: samlConfig.entryPoint,
      idpCert: samlConfig.idpCert,
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: false,
    });
  }

  getMetadata(): string {
    return this.saml.generateServiceProviderMetadata(null);
  }

  async getLoginUrl(): Promise<string> {
    return this.saml.getAuthorizeUrlAsync('', undefined, {});
  }

  async validatePostResponse(
    body: Record<string, string>,
  ) {
    return this.saml.validatePostResponseAsync(body);
  }
}