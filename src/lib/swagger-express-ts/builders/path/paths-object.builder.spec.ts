import * as chai from "chai";
import * as sinon from "sinon";
import { IApiArgs } from "../../decorators/api.decorator";
import { PathsObjectBuilder } from "./paths-object.builder";
import { PathItemObjectBuilder } from "./path-item-object.builder";
import {
  IApiOperationArgsForResource,
  IOperationObject
} from "./operation-object.builder";
import { HttpMethod } from "../../swagger-definition.constant";

const expect = chai.expect;

describe("PathsObjectBuilder", () => {
  let pathsObjectBuilder: PathsObjectBuilder;

  const pathItemObjectBuilder: PathItemObjectBuilder = new PathItemObjectBuilder();
  const withParameters = sinon
    .stub(pathItemObjectBuilder, "withParameters")
    .returnsThis();
  const merge = sinon.stub(pathItemObjectBuilder, "merge").returnsThis();
  const withOperation = sinon
    .stub(pathItemObjectBuilder, "withOperation")
    .returnsThis();
  const asRef = sinon.stub(pathItemObjectBuilder, "asRef").returnsThis();
  const buildStub = sinon.stub(pathItemObjectBuilder, "build");
  const reset = sinon.stub(pathItemObjectBuilder, "reset").returnsThis();
  const path = "/path";
  const $ref = "./references/PathItemObject.yaml";

  beforeEach(() => {
    pathsObjectBuilder = new PathsObjectBuilder(pathItemObjectBuilder);
    buildStub.reset();
    reset.resetHistory();
    withParameters.resetHistory();
  });

  describe("withPath", () => {
    let args: IApiArgs;

    it('should fail when path not starts with "/"', () => {
      args = {
        path: "bad-path"
      };

      expect(() => {
        pathsObjectBuilder.withPath(args).build();
      }).to.throw(
        'Path has to start with "/" symbol. Actual = "bad-path". Should be "/bad-path"'
      );

      expect(() => {
        pathsObjectBuilder.withPath({ path: null }).build();
      }).to.throw(
        'Path has to start with "/" symbol. Actual = "null". Should be "/null"'
      );
    });

    it("should fail when same path found", () => {
      buildStub.returns({});
      args = {
        path: "/path"
      };
      pathsObjectBuilder.withPath(args);

      expect(() => {
        pathsObjectBuilder.withPath(args).build();
      }).to.throw('Duplicate mapping key "/path"');
    });

    it("should call PathItemObjectBuilder.forPath(path).build()", () => {
      buildStub.returns({});

      args = {
        path
      };

      expect(pathsObjectBuilder.withPath(args).build()).to.deep.equal({});
      expect(reset.calledOnce).to.be.true;
      expect(buildStub.calledOnce).to.be.true;
    });

    it("should call PathItemObjectBuilder.forPath(path).withParameters(parameters).build()", () => {
      buildStub.returns({});

      args = {
        path,
        parameters: []
      };

      expect(pathsObjectBuilder.withPath(args).build()).to.deep.equal({});
      expect(reset.calledOnce).to.be.true;
      expect(withParameters.calledOnce).to.be.true;
      expect(withParameters.calledWith([])).to.be.true;
      expect(buildStub.calledOnce).to.be.true;
    });

    it("should set string instead of path item instance", () => {
      buildStub.returns({
        $ref
      });

      args = {
        path,
        $ref
      };

      expect(pathsObjectBuilder.withPath(args).build()).to.deep.equal({
        "/path": {
          $ref
        }
      });

      expect(reset.calledOnce).to.be.true;
      expect(asRef.calledOnce).to.be.true;
      expect(asRef.calledWith($ref)).to.be.true;
    });

    it("should fail when parameters set and also set $ref", () => {
      args = {
        path,
        $ref,
        parameters: []
      };

      expect(() => {
        pathsObjectBuilder.withPath(args).build();
      }).to.throw(
        'Unable to set parameters for path item object when defined as $ref for path = "/path"'
      );
    });
  });

  describe("withOperation", () => {
    let operation: IOperationObject;
    let args: IApiOperationArgsForResource;
    const method = HttpMethod.GET;

    beforeEach(() => {
      operation = {
        responses: {}
      };

      withOperation.resetHistory();
      merge.resetHistory();
      args = { resource: path, responses: {}, method: HttpMethod.GET };
    });

    it('should fail when path set but not starts with "/"', () => {
      args.path = "bad-path";

      expect(() => {
        pathsObjectBuilder.withOperation({ args, operation }).build();
      }).to.throw(
        'Path has to start with "/" symbol. Actual = "bad-path". Should be "/bad-path"'
      );
    });

    it("should set operation under resource when path not set", () => {
      buildStub.returns({});

      pathsObjectBuilder.withPath({ path });
      buildStub.returns({
        get: {
          responses: {}
        }
      });

      expect(
        pathsObjectBuilder.withOperation({ args, operation }).build()
      ).to.deep.equal({
        "/path": {
          get: {
            responses: {}
          }
        }
      });

      expect(merge.calledOnce).to.be.true;
      expect(merge.calledWith({})).to.be.true;
      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith({ method, ...operation })).to.be.true;
      expect(reset.calledTwice).to.be.true;
      expect(buildStub.calledTwice).to.be.true;
    });

    it('should set operation under resource when path set to "/"', () => {
      buildStub.returns({});

      pathsObjectBuilder.withPath({ path });
      buildStub.returns({
        get: {
          responses: {}
        }
      });

      expect(
        pathsObjectBuilder.withOperation({ args, operation }).build()
      ).to.deep.equal({
        "/path": {
          get: {
            responses: {}
          }
        }
      });

      expect(merge.calledOnce).to.be.true;
      expect(merge.calledWith({})).to.be.true;
      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith({ method, ...operation })).to.be.true;
      expect(buildStub.calledTwice).to.be.true;
      expect(reset.calledTwice).to.be.true;
    });

    it("should add another path item object as sub-resource", () => {
      buildStub.returns({});

      pathsObjectBuilder.withPath({ path });
      buildStub.returns({
        get: {
          responses: {}
        }
      });
      args.path = "/extension";
      expect(
        pathsObjectBuilder.withOperation({ args, operation }).build()
      ).to.deep.equal({
        "/path/extension": {
          get: {
            responses: {}
          }
        }
      });

      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith({ method, ...operation })).to.be.true;
      expect(buildStub.calledTwice).to.be.true;
      expect(reset.calledTwice).to.be.true;
    });

    it("should merge with existing path item object", () => {
      buildStub.returns({});
      pathsObjectBuilder.withPath({ path });

      buildStub.returns({
        get: {
          responses: {}
        }
      });
      pathsObjectBuilder.withOperation({ args, operation });

      expect(merge.calledOnce).to.be.true;
      expect(merge.calledWith({})).to.be.true;
      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith({ method, ...operation })).to.be.true;
      expect(buildStub.calledTwice).to.be.true;
      expect(reset.calledTwice).to.be.true;

      args.method = HttpMethod.POST;

      buildStub.returns({
        get: {
          responses: {}
        },
        post: {
          responses: {}
        }
      });

      pathsObjectBuilder.withOperation({ args, operation });

      expect(merge.calledTwice).to.be.true;
      expect(
        merge.calledWith({
          get: {
            responses: {}
          }
        })
      ).to.be.true;
      expect(withOperation.calledTwice).to.be.true;
      expect(withOperation.calledWith({ method, ...operation })).to.be.true;
      expect(buildStub.calledThrice).to.be.true;
      expect(reset.calledThrice).to.be.true;

      expect(pathsObjectBuilder.build()).to.deep.equals({
        "/path": {
          get: {
            responses: {}
          },
          post: {
            responses: {}
          }
        }
      });
    });

    it("should fail when given resource is set to $res", () => {
      buildStub.returns({
        $ref
      });

      expect(() => {
        pathsObjectBuilder
          .withPath({ path, $ref })
          .withOperation({ args, operation })
          .build();
      }).to.throw(
        'Unable to add operation when resource "/path" defined as $ref'
      );
    });

    it("should fail when sub-resource path with dynamic parameters could be matched", () => {
      buildStub.returns({});
      pathsObjectBuilder
        .withPath({ path: path + "/extension" })
        .withPath({ path });

      args.path = "/:value";

      expect(() => {
        pathsObjectBuilder.withOperation({ args, operation }).build();
      }).to.throw(
        'Possible duplicate with resource = "/path/extension" sub-resource = "/path/:value"'
      );

      args.path = "/{value}";
      expect(() => {
        pathsObjectBuilder.withOperation({ args, operation }).build();
      }).to.throw(
        'Possible duplicate with resource = "/path/extension" sub-resource = "/path/{value}"'
      );
    });
  });
});
