import * as chai from "chai";
import * as sinon from "sinon";
import { PathItemObjectBuilder } from "./path-item-object.builder";
import { ParametersBuilder } from "../parameters.builder";
import { HttpMethod } from "../../swagger-definition.constant";

const expect = chai.expect;

describe("PathItemObjectBuilder", () => {
  let pathItemObjectBuilder: PathItemObjectBuilder;
  const parametersBuilder: ParametersBuilder = new ParametersBuilder();

  const parametersBuilderBuild = sinon.stub(parametersBuilder, "build");
  const fromParameters = sinon
    .stub(parametersBuilder, "fromParameters")
    .returnsThis();

  const reset = sinon.stub(parametersBuilder, "reset").returnsThis();

  beforeEach(() => {
    pathItemObjectBuilder = new PathItemObjectBuilder(parametersBuilder);
    parametersBuilderBuild.reset();
    reset.resetHistory();
    fromParameters.resetHistory();
  });

  describe("withParameters", () => {
    it("should fail when $ref set", () => {
      pathItemObjectBuilder.merge({
        $ref: "reference"
      });

      expect(() => {
        pathItemObjectBuilder.withParameters([]);
      }).to.throw(
        "Unable to define parameters. Unsupported modification of path item object defined as $ref"
      );
    });

    it("should set global parameters for path item object", () => {
      parametersBuilderBuild.returns([]);

      const parameter = { name: "param", in: "query" };
      const value = pathItemObjectBuilder.withParameters([parameter]).build();
      expect(value).to.deep.equals({
        parameters: []
      });

      expect(parametersBuilderBuild.calledOnce).to.be.true;
      expect(fromParameters.calledOnce).to.be.true;
      expect(fromParameters.calledWith([parameter])).to.be.true;
    });

    it("should not set parameters when empty", () => {
      let value = pathItemObjectBuilder.withParameters([]).build();
      expect(value).to.deep.equals({});

      value = pathItemObjectBuilder.withParameters(null).build();
      expect(value).to.deep.equals({});

      value = pathItemObjectBuilder.withParameters(undefined).build();
      expect(value).to.deep.equals({});

      expect(parametersBuilderBuild.notCalled).to.be.true;
      expect(fromParameters.notCalled).to.be.true;
    });
  });

  describe("withOperation", () => {
    it("should fail when operation method already defined", () => {
      pathItemObjectBuilder.merge({
        get: { responses: {} }
      });

      expect(() => {
        pathItemObjectBuilder.withOperation({
          method: HttpMethod.GET,
          responses: {}
        });
      }).to.throw('Method "get" already defined');
    });
    it("should add get operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.GET, responses: {} })
        .build();
      expect(value).to.deep.equal({
        get: { responses: {} }
      });
    });
    it("should add post operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.POST, responses: {} })
        .build();
      expect(value).to.deep.equal({
        post: { responses: {} }
      });
    });
    it("should add delete operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.DELETE, responses: {} })
        .build();
      expect(value).to.deep.equal({
        delete: { responses: {} }
      });
    });
    it("should add patch operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.PATCH, responses: {} })
        .build();
      expect(value).to.deep.equal({
        patch: { responses: {} }
      });
    });
    it("should add put operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.PUT, responses: {} })
        .build();
      expect(value).to.deep.equal({
        put: { responses: {} }
      });
    });
    it("should add options operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.OPTIONS, responses: {} })
        .build();
      expect(value).to.deep.equal({
        options: { responses: {} }
      });
    });
    it("should add head operation", () => {
      const value = pathItemObjectBuilder
        .withOperation({ method: HttpMethod.HEAD, responses: {} })
        .build();
      expect(value).to.deep.equal({
        head: { responses: {} }
      });
    });
  });

  describe("merge", () => {
    it("should add path item object when not set already", () => {
      const value = pathItemObjectBuilder.merge({}).build();

      expect(value).to.deep.equal({});
    });
    it("should override set properties of path item object when set already", () => {
      pathItemObjectBuilder.merge({
        get: { responses: {} }
      });

      pathItemObjectBuilder.merge({
        get: { responses: {}, operationId: "operation1" }
      });

      expect(pathItemObjectBuilder.build()).to.deep.equal({
        get: { responses: {}, operationId: "operation1" }
      });

      pathItemObjectBuilder.merge({
        post: { responses: {} }
      });

      expect(pathItemObjectBuilder.build()).to.deep.equal({
        get: { responses: {}, operationId: "operation1" },
        post: { responses: {} }
      });
    });

    it("should fail when previously set as $ref", () => {
      pathItemObjectBuilder.merge({
        $ref: "reference"
      });

      expect(() => {
        pathItemObjectBuilder.merge({
          get: { responses: {} }
        });
      }).to.throw(
        "Unsupported modification of path item object defined as $ref."
      );
    });

    it("should fail when path item object not defined properly", () => {
      expect(() => {
        pathItemObjectBuilder.merge({
          $ref: "reference",
          get: { responses: {} }
        });
      }).to.throw("Illegal state of path item object.");

      expect(() => {
        pathItemObjectBuilder.merge({
          $ref: "reference",
          parameters: []
        });
      }).to.throw("Illegal state of path item object.");
    });
  });

  describe("asRef", () => {
    it("should set $ref", () => {
      expect(pathItemObjectBuilder.asRef("reference").build()).to.deep.equal({
        $ref: "reference"
      });
    });

    it("should fail when already set parameters or any operation", () => {
      pathItemObjectBuilder.merge({
        get: { responses: {} }
      });

      expect(() => {
        pathItemObjectBuilder.asRef("reference");
      }).to.throw(
        "Unable to set as reference while operations or parameters are set."
      );
    });

    it("should fail when $ref is empty", () => {
      expect(() => {
        pathItemObjectBuilder.asRef(null);
      }).to.throw("$ref value cannot be empty.");
    });
  });

  describe("reset", () => {
    it("should reset parametersBuilder", () => {
      pathItemObjectBuilder.reset();

      expect(reset.calledOnce).to.be.true;
    });
  });
});
