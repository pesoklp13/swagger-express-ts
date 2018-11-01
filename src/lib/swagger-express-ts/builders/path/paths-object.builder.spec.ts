import * as chai from "chai";
import * as sinon from "sinon";
import { IApiArgs } from "../../decorators/api.decorator";
import { PathsObjectBuilder } from "./paths-object.builder";
import { PathItemObjectBuilder } from "./path-item-object.builder";
import { IOperationObject } from "./operation-object.builder";
import { HttpMethod } from "../../swagger-definition.constant";

const expect = chai.expect;

describe("PathsObjectBuilder", () => {
  let pathsObjectBuilder: PathsObjectBuilder;
  const forPath = sinon
    .stub(PathItemObjectBuilder.prototype, "forPath")
    .returnsThis();
  const withParameters = sinon
    .stub(PathItemObjectBuilder.prototype, "withParameters")
    .returnsThis();
  const merge = sinon
    .stub(PathItemObjectBuilder.prototype, "merge")
    .returnsThis();
  const withOperation = sinon
    .stub(PathItemObjectBuilder.prototype, "withOperation")
    .returnsThis();
  const asRef = sinon
    .stub(PathItemObjectBuilder.prototype, "asRef")
    .returnsThis();
  const buildStub = sinon.stub(PathItemObjectBuilder.prototype, "build");
  const path = "/path";
  const $ref = "./references/PathItemObject.yaml";

  beforeEach(() => {
    pathsObjectBuilder = new PathsObjectBuilder();
    buildStub.reset();
    forPath.resetHistory();
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

      expect(forPath.calledOnce).to.be.true;
      expect(forPath.calledWith(path));
      expect(buildStub.calledOnce).to.be.true;
    });

    it("should call PathItemObjectBuilder.forPath(path).withParameters(parameters).build()", () => {
      buildStub.returns({});

      args = {
        path,
        parameters: []
      };
      expect(pathsObjectBuilder.withPath(args).build()).to.deep.equal({});

      expect(forPath.calledOnce).to.be.true;
      expect(forPath.calledWith(path));
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

    beforeEach(() => {
      operation = {
        resource: path,
        method: HttpMethod.GET,
        responses: {}
      };

      withOperation.resetHistory();
      merge.resetHistory();
    });

    it('should fail when path set but not starts with "/"', () => {
      operation.path = "bad-path";

      expect(() => {
        pathsObjectBuilder.withOperation(operation).build();
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

      expect(pathsObjectBuilder.withOperation(operation).build()).to.deep.equal(
        {
          "/path": {
            get: {
              responses: {}
            }
          }
        }
      );

      expect(merge.calledOnce).to.be.true;
      expect(merge.calledWith({})).to.be.true;
      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith(operation)).to.be.true;
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

      expect(pathsObjectBuilder.withOperation(operation).build()).to.deep.equal(
        {
          "/path": {
            get: {
              responses: {}
            }
          }
        }
      );

      expect(merge.calledOnce).to.be.true;
      expect(merge.calledWith({})).to.be.true;
      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith(operation)).to.be.true;
      expect(buildStub.calledTwice).to.be.true;
    });

    it("should add another path item object as sub-resource", () => {
      buildStub.returns({});

      pathsObjectBuilder.withPath({ path });
      buildStub.returns({
        get: {
          responses: {}
        }
      });
      operation.path = "/extension";
      expect(pathsObjectBuilder.withOperation(operation).build()).to.deep.equal(
        {
          "/path/extension": {
            get: {
              responses: {}
            }
          }
        }
      );

      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith(operation)).to.be.true;
      expect(buildStub.calledTwice).to.be.true;
    });

    it("should merge with existing path item object", () => {
      buildStub.returns({});
      pathsObjectBuilder.withPath({ path });

      buildStub.returns({
        get: {
          responses: {}
        }
      });
      pathsObjectBuilder.withOperation(operation);

      expect(merge.calledOnce).to.be.true;
      expect(merge.calledWith({})).to.be.true;
      expect(withOperation.calledOnce).to.be.true;
      expect(withOperation.calledWith(operation)).to.be.true;
      expect(buildStub.calledTwice).to.be.true;

      operation.method = HttpMethod.POST;

      buildStub.returns({
        get: {
          responses: {}
        },
        post: {
          responses: {}
        }
      });

      pathsObjectBuilder.withOperation(operation);

      expect(merge.calledTwice).to.be.true;
      expect(
        merge.calledWith({
          get: {
            responses: {}
          }
        })
      ).to.be.true;
      expect(withOperation.calledTwice).to.be.true;
      expect(withOperation.calledWith(operation)).to.be.true;
      expect(buildStub.calledThrice).to.be.true;

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
          .withOperation(operation)
          .build();
      }).to.throw(
        'Unable to add operation when resource "/path" defined as $ref'
      );
    });
  });
});
