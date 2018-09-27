import "reflect-metadata";
import * as chai from "chai";
import { InfoObjectBuilder } from "./info-object.builder";

const expect = chai.expect;

describe("InfoObjectBuilder", () => {
  let builder: InfoObjectBuilder;
  const title = "Title";
  const version = "1.0.0";

  beforeEach(() => {
    builder = new InfoObjectBuilder();
    builder.withDefaultValues(title, version);
  });

  it("should fail when no default info set", () => {
    builder = new InfoObjectBuilder();
    expect(() => {
      builder.build();
    }).to.throw("Default info must be set");
  });

  it("should build default info object", () => {
    const info = builder.build();
    expect(info).to.deep.equal({ title, version });
  });

  it("should build info object with description", () => {
    const description = "description";
    builder.withDescription(description);
    const info = builder.build();
    expect(info).to.deep.equal({ title, version, description });
  });

  it("should build info object with termsOfService", () => {
    const termsOfService = "termsOfService";
    builder.withTermsOfService(termsOfService);
    const info = builder.build();
    expect(info).to.deep.equal({ title, version, termsOfService });
  });

  it("should build info object with contact", () => {
    const contact = {
      name: "name",
      url: "http://test.eu",
      email: "test@test.eu"
    };

    builder.withContact(contact);
    const info = builder.build();
    expect(info).to.deep.equal({ title, version, contact });
  });

  it("should build info object with contact with name only", () => {
    const contact = {
      name: "name"
    };

    builder.withContact(contact);
    const info = builder.build();
    expect(info).to.deep.equal({ title, version, contact });
  });

  it("expect fail when invalid email for contact", () => {
    expect(() => {
      builder.withContact({ email: "bademail" });
    }).to.throw("email has to be valid EMAIL");
  });

  it("expect fail when invalid url for contact", () => {
    expect(() => {
      builder.withContact({ url: "localhost" });
    }).to.throw("url has to be valid URI");
  });

  it("should build info object with license", () => {
    const license = {
      name: "name",
      url: "http://test.eu"
    };

    builder.withLicense(license);
    const info = builder.build();
    expect(info).to.deep.equal({ title, version, license });
  });

  it("should build info object with license with name only", () => {
    const license = {
      name: "name"
    };

    builder.withLicense(license);
    const info = builder.build();
    expect(info).to.deep.equal({ title, version, license });
  });

  it("expect fail when invalid url for license", () => {
    expect(() => {
      builder.withLicense({ name: "name", url: "localhost" });
    }).to.throw("url has to be valid URI");
  });
});
