import { ISwaggerContact, ISwaggerInfo, ISwaggerLicense } from "../i-swagger";
import {
  Pattern,
  PatternEnum,
  Validate
} from "../decorators/validate.decorator";
import * as _ from "lodash";

export class InfoObjectBuilder {
  constructor() {
    this.infoObject = {} as any;
  }

  private infoObject: ISwaggerInfo;
  private defaultInfoSet: boolean;

  public withDefaultValues(title: string, version: string): InfoObjectBuilder {
    this.infoObject = _.mergeWith(this.infoObject, {
      title,
      version
    });
    this.defaultInfoSet = true;
    return this;
  }

  public withDescription(description: string): InfoObjectBuilder {
    this.infoObject.description = description;
    return this;
  }

  public withTermsOfService(termsOfService: string): InfoObjectBuilder {
    this.infoObject.termsOfService = termsOfService;
    return this;
  }

  @Validate
  public withContact(
    @Pattern({ pattern: PatternEnum.URI, path: "url", nullable: true })
    @Pattern({ pattern: PatternEnum.EMAIL, path: "email", nullable: true })
    contact: ISwaggerContact
  ): InfoObjectBuilder {
    this.infoObject.contact = contact;
    return this;
  }

  @Validate
  public withLicense(
    @Pattern({ pattern: PatternEnum.URI, path: "url", nullable: true })
    license: ISwaggerLicense
  ): InfoObjectBuilder {
    this.infoObject.license = license;
    return this;
  }

  public build(): ISwaggerInfo {
    if (!this.defaultInfoSet) {
      throw new Error("Default info must be set");
    }

    return this.infoObject;
  }
}
