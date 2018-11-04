import "reflect-metadata";
import * as chai from "chai";
import * as sinon from "sinon";
import { Api, ApiOperation, PATH } from "./api.decorator";
import { SwaggerService } from "../swagger.service";
import { OperationObjectBuilder } from "../builders/path/operation-object.builder";
import { HttpMethod } from "../swagger-definition.constant";

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe("Api decorators tests", () => {
  const service = SwaggerService.getInstance();
  const pathsObjectBuilder = {
    withPath: sandbox.stub(),
    withOperation: sandbox.stub()
  };

  const withArguments = sandbox
    .stub(OperationObjectBuilder.prototype, "withArguments")
    .returnsThis();
  const withOperationId = sandbox
    .stub(OperationObjectBuilder.prototype, "withOperationId")
    .returnsThis();
  const operationBuild = sandbox
    .stub(OperationObjectBuilder.prototype, "build")
    .returns({});

  const serviceGetPathsBuilder = sandbox
    .stub(service, "getPathsBuilder")
    .returns(pathsObjectBuilder);
  const path = "/path";

  let target: any;

  beforeEach(() => {
    target = {};
    serviceGetPathsBuilder.resetHistory();
  });

  after(() => {
    sandbox.restore();
  });

  describe("@Api", () => {
    const decorate: ClassDecorator = Api({ path });

    it("should call proper methods under builder from current SwaggerService", () => {
      decorate(target);

      expect(Reflect.getOwnMetadata(PATH, target)).to.deep.equal({ path });

      expect(serviceGetPathsBuilder.calledOnce).to.be.true;
      expect(pathsObjectBuilder.withPath.calledOnce).to.be.true;
      expect(pathsObjectBuilder.withPath.calledWith({ path })).to.be.true;
    });
  });

  describe("@ApiOperation", () => {
    const args = { responses: {}, method: HttpMethod.GET };
    const decorate: MethodDecorator = ApiOperation(args);
    const propertyKey = "testMethod";

    it("should call proper methods under builder from current SwaggerService", () => {
      Reflect.defineMetadata(PATH, { path }, target);
      decorate(target, propertyKey, null);
      expect(serviceGetPathsBuilder.calledOnce).to.be.true;

      expect(withArguments.calledOnce).to.be.true;
      expect(withArguments.calledWith(args)).to.be.true;
      expect(withOperationId.calledOnce).to.be.true;
      expect(withOperationId.calledWith(propertyKey)).to.be.true;
      expect(operationBuild.calledOnce).to.be.true;

      expect(pathsObjectBuilder.withOperation.calledOnce).to.be.true;
      expect(
        pathsObjectBuilder.withOperation.calledWith({
          args: {
            resource: path,
            ...args
          },
          operation: {}
        })
      ).to.be.true;
    });

    it("should fail when no metadata set for target", () => {
      class TestClass {}

      const cls = new TestClass();

      expect(() => {
        decorate(cls, propertyKey, null);
      }).to.throw(
        'Class TestClass has to be annotated with @Api({path: "/{path}"})'
      );
    });
  });
});
