declare module 'xml-crypto' {
  export class SignedXml {
    signingKey: string | Buffer;
    keyInfoProvider: {
      getKeyInfo(): string;
    };
    addReference(options: {
      xpath: string;
      transforms: string[];
      digestAlgorithm: string;
    }): void;
    computeSignature(xml: string): void;
    getSignedXml(): string;
  }
}
