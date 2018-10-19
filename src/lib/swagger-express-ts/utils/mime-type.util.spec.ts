import "reflect-metadata";
import * as chai from "chai";
import { MimeTypeUtil } from "./mime-type.util";
import { SwaggerMimeType } from "../swagger-definition.constant";

const expect = chai.expect;

describe("MimeTypeUtil", () => {
  describe("valueOf", () => {
    it("should return same type as input", () => {
      const result = MimeTypeUtil.valueOf(SwaggerMimeType.APPLICATION_JSON);
      expect(result).to.deep.equal(SwaggerMimeType.APPLICATION_JSON);
    });

    it("should return MimeType instead of string", () => {
      const result = MimeTypeUtil.valueOf("application/json");
      expect(result).to.deep.equal(SwaggerMimeType.APPLICATION_JSON);
    });

    it("should fail when non existing type as input (no vendor)", () => {
      expect(() => {
        MimeTypeUtil.valueOf("application/badjson");
      }).to.throw('Unsupported MimeType "application/badjson"');
    });

    it("should return same type string as input (vendor application)", () => {
      const type = "application/vnd.github-issue.text+json";
      const result = MimeTypeUtil.valueOf(type);
      expect(result).to.deep.equal(type);
    });

    it("should return same type string as input (vendor image)", () => {
      const type = "image/vnd.djvu";
      const result = MimeTypeUtil.valueOf(type);
      expect(result).to.deep.equal(type);
    });

    it("should fail when fake vendor type send", () => {
      expect(() => {
        MimeTypeUtil.valueOf("test/vnd.djvu");
      }).to.throw('Unsupported MimeType "test/vnd.djvu"');
    });

    it("should fail when empty argument", () => {
      expect(() => {
        MimeTypeUtil.valueOf(null);
      }).to.throw("Cannot be empty");
    });
  });

  describe("toMimeType", () => {
    it("should return MimeType", () => {
      expect(MimeTypeUtil.toMimeType("application/json")).to.deep.equal(
        SwaggerMimeType.APPLICATION_JSON
      );
    });

    it("should fail when corresponding MimeType not exists", () => {
      expect(() => {
        MimeTypeUtil.toMimeType("application/badjson");
      }).to.throw('Unsupported MimeType "application/badjson"');
    });

    it("should fail when */* unsupported MimeType use specific MimeType", () => {
      expect(() => {
        MimeTypeUtil.toMimeType("*/*");
      }).to.throw("Unsupported MimeType */*. Use specific MimeType instead");
    });

    it("should fail when empty argument", () => {
      expect(() => {
        MimeTypeUtil.toMimeType(null);
      }).to.throw("Cannot be empty");
    });
  });

  describe("isVendorType", () => {
    it("should return true when application/vnd.github-issue.text+json", () => {
      expect(
        MimeTypeUtil.isVendorType("application/vnd.github-issue.text+json")
      ).to.be.true;
    });

    it("should return true when image/vnd.djvu", () => {
      expect(MimeTypeUtil.isVendorType("image/vnd.djvu")).to.be.true;
    });

    it("should return false when test/vnd.djvu", () => {
      expect(MimeTypeUtil.isVendorType("test/vnd.djvu")).to.be.false;
    });

    it("should return false when image/image", () => {
      expect(MimeTypeUtil.isVendorType("image/image")).to.be.false;
    });

    it("should fail when empty argument", () => {
      expect(() => {
        MimeTypeUtil.isVendorType(null);
      }).to.throw("Cannot be empty");
    });
  });
});
