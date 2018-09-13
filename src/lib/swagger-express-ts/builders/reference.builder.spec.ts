import { ReferenceBuilder, ReferenceType } from "./reference.builder";
import * as chai from "chai";

const expect = chai.expect;

describe("ReferenceBuilder", () => {
  it("create definitions reference", () => {
    const builder = new ReferenceBuilder(ReferenceType.definitions);
    builder.withValue("model");
    expect(builder.build()).to.be.equals("#/definitions/Model");
  });

  it("create responses reference", () => {
    const builder = new ReferenceBuilder(ReferenceType.responses);
    builder.withValue("response");
    expect(builder.build()).to.be.equals("#/responses/Response");
  });

  it("create responses after type changed", () => {
    const builder = new ReferenceBuilder();
    builder.withValue("model");
    expect(builder.build()).to.be.equals("#/definitions/Model");
    builder.withType(ReferenceType.responses);
    builder.withValue("response");
    expect(builder.build()).to.be.equals("#/responses/Response");
  });
});
