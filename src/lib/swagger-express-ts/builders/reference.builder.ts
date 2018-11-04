import * as _ from "lodash";

export interface IReferenceObject {
  $ref: string;
}

export enum ReferenceType {
  definitions,
  responses
  // TODO add parameters as type
}

export class ReferenceBuilder {
  constructor(
    private referenceType: ReferenceType = ReferenceType.definitions
  ) {}

  private referenceValue: string;

  public withValue(value: string) {
    this.referenceValue = value;
    return this;
  }

  public withType(type: ReferenceType) {
    this.referenceType = type;
    return this;
  }

  // TODO
  // public forDefinitions
  // public forResponses

  // TODO change to build IReferenceObject
  public build(): string {
    return "#/"
      .concat(ReferenceType[this.referenceType])
      .concat("/")
      .concat(_.upperFirst(this.referenceValue));
  }
}
