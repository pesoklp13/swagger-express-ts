import "reflect-metadata";
import { SwaggerService } from "./swagger.service";
import * as chai from "chai";
import * as sinon from "sinon";
import {
  ISwaggerExternalDocs,
  ISwaggerInfo,
  ISwaggerPath,
  SwaggerScheme
} from "./i-swagger";
import { IApiPathArgs } from "./api-path.decorator";
import { IApiOperationGetArgs } from "./api-operation-get.decorator";
import { IApiOperationPostArgs } from "./api-operation-post.decorator";
import { IApiOperationPutArgs } from "./api-operation-put.decorator";
import { IApiOperationPatchArgs } from "./api-operation-patch.decorator";
import { IApiOperationDeleteArgs } from "./api-operation-delete.decorator";
import { SwaggerDefinitionConstant } from "./swagger-definition.constant";
import { ISwaggerBuildDefinitionModel } from "./swagger.builder";
import { DataType } from "./i-api-operation-args.base";
import { VersionsController } from "../../version/versions.controller";
import { InfoObjectBuilder } from "./builders/info-object.builder";

const expect = chai.expect;

describe("SwaggerService", () => {
  beforeEach(() => {
    SwaggerService.getInstance().resetData();
  });

  describe("setBasePath", () => {
    it('expect basePath default "/"', () => {
      expect(SwaggerService.getInstance().getData().basePath).to.equal("/");
    });

    it("expect basePath exist when it setted", () => {
      const basePath = "/basepath";

      SwaggerService.getInstance().setBasePath(basePath);

      expect(SwaggerService.getInstance().getData().basePath).to.equal(
        basePath
      );
    });
  });

  describe("setOpenapi", () => {
    it("expect default openapi when it not setted", () => {
      expect(SwaggerService.getInstance().getData().openapi).to.not.exist;
    });

    it("expect openapi exist when it setted", () => {
      const openapi = "openapi";

      SwaggerService.getInstance().setOpenapi(openapi);

      expect(SwaggerService.getInstance().getData().openapi).to.equal(openapi);
    });
  });

  describe("setInfo", () => {
    let info: ISwaggerInfo;
    let swaggerService: SwaggerService;

    let withDescriptionSpy: any;
    let withTermsOfServiceSpy: any;
    let withConcactSpy: any;
    let withLicenseSpy: any;
    let buildSpy: any;
    let withDefaultValuesSpy: any;

    beforeEach(() => {
      info = {
        title: "Title",
        version: "1.0.1",
        description: "description",
        termsOfService: "termsOfService"
      };

      const infoBuilder = new InfoObjectBuilder();
      withDescriptionSpy = sinon.spy(infoBuilder, "withDescription");
      withTermsOfServiceSpy = sinon.spy(infoBuilder, "withTermsOfService");
      withConcactSpy = sinon.spy(infoBuilder, "withContact");
      withLicenseSpy = sinon.spy(infoBuilder, "withLicense");
      buildSpy = sinon.spy(infoBuilder, "build");
      withDefaultValuesSpy = sinon.spy(infoBuilder, "withDefaultValues");

      swaggerService = SwaggerService.getInstance().withInfoBuilder(
        infoBuilder
      );
    });

    it("should be called InfoObjectBuilder without contact and license", () => {
      swaggerService.setInfo(info);

      expectDefaultSpyObjects();
      expect(withConcactSpy.notCalled).to.be.true;
      expect(withLicenseSpy.notCalled).to.be.true;
      expect(swaggerService.getData().info).to.be.deep.equal(info);
    });

    it("should be called InfoObjectBuilder with contact", () => {
      info.contact = {
        name: "name"
      };

      swaggerService.setInfo(info);

      expectDefaultSpyObjects();
      expect(withConcactSpy.calledOnce).to.be.true;
      expect(withLicenseSpy.notCalled).to.be.true;

      expect(swaggerService.getData().info).to.be.deep.equal(info);
    });

    it("should be called InfoObjectBuilder with license", () => {
      info.license = {
        name: "name"
      };

      swaggerService.setInfo(info);

      expectDefaultSpyObjects();
      expect(withConcactSpy.notCalled).to.be.true;
      expect(withLicenseSpy.calledOnce).to.be.true;

      expect(swaggerService.getData().info).to.be.deep.equal(info);
    });

    function expectDefaultSpyObjects() {
      expect(withTermsOfServiceSpy.calledOnce).to.be.true;
      expect(withDefaultValuesSpy.calledOnce).to.be.true;
      expect(withDescriptionSpy.calledOnce).to.be.true;
      expect(buildSpy.calledOnce).to.be.true;
    }
  });

  describe("setSchemes", () => {
    it("expect default schemes when it not defined", () => {
      expect(SwaggerService.getInstance().getData().schemes)
        .to.have.lengthOf(1)
        .to.have.members([SwaggerScheme.HTTP]);

      expect(
        JSON.stringify(SwaggerService.getInstance().getData().schemes)
      ).to.deep.equals(JSON.stringify(["http"]));
    });

    it("expect schemes when it defined", () => {
      const schemes: SwaggerScheme[] = [
        SwaggerScheme.HTTP,
        SwaggerScheme.HTTPS
      ];

      SwaggerService.getInstance().setSchemes(schemes);

      expect(SwaggerService.getInstance().getData().schemes).to.deep.equal(
        schemes
      );

      expect(
        JSON.stringify(SwaggerService.getInstance().getData().schemes)
      ).to.deep.equals(JSON.stringify(["http", "https"]));
    });
  });

  describe("setExternalDocs", () => {
    it("expect default externalDocs when it not defined", () => {
      expect(SwaggerService.getInstance().getData().externalDocs).to.not.exist;
    });

    it("expect externalDocs when it defined", () => {
      const externalDocs: ISwaggerExternalDocs = {
        url: "HTTP://localhost:8080"
      };

      SwaggerService.getInstance().setExternalDocs(externalDocs);

      expect(SwaggerService.getInstance().getData().externalDocs.url).to.equal(
        externalDocs.url
      );
    });
    it("expect fail when invalid externalDocs value set", () => {
      const externalDocs: ISwaggerExternalDocs = {
        url: "localhost"
      };

      expect(() => {
        SwaggerService.getInstance().setExternalDocs(externalDocs);
      }).to.throw("url has to be valid URI");
    });
  });

  describe("setProduces", () => {
    it("expect default produces when it not defined", () => {
      expect(SwaggerService.getInstance().getData().produces)
        .to.have.lengthOf(1)
        .to.have.members([SwaggerDefinitionConstant.Produce.JSON]);
    });

    it("expect produces when it defined", () => {
      const produces: string[] = [
        SwaggerDefinitionConstant.Produce.JSON,
        SwaggerDefinitionConstant.Produce.XML
      ];

      SwaggerService.getInstance().setProduces(produces);

      expect(SwaggerService.getInstance().getData().produces).to.deep.equal(
        produces
      );
    });
  });

  describe("setConsumes", () => {
    it("expect default consumes when it not defined", () => {
      expect(SwaggerService.getInstance().getData().consumes)
        .to.have.lengthOf(1)
        .to.have.members([SwaggerDefinitionConstant.Consume.JSON]);
    });

    it("expect consumes when it defined", () => {
      const consumes: string[] = [
        SwaggerDefinitionConstant.Consume.JSON,
        SwaggerDefinitionConstant.Consume.XML
      ];

      SwaggerService.getInstance().setConsumes(consumes);

      expect(SwaggerService.getInstance().getData().consumes).to.deep.equal(
        consumes
      );
    });
  });

  describe("setHost", () => {
    it("expect host not exist when it not defined", () => {
      expect(SwaggerService.getInstance().getData().host).to.be.not.exist;
    });

    it("should be set host", () => {
      const host: string = "host";

      SwaggerService.getInstance().setHost(host);

      expect(SwaggerService.getInstance().getData().host).to.equal(host);
    });
    it("should fail when set bad host", () => {
      expect(() => {
        SwaggerService.getInstance().setHost("HTTP://host");
      }).to.throw("host has to be valid HOST");
    });
  });

  describe("setDefinitions", () => {
    it("expect default definitions when they not defined", () => {
      expect(SwaggerService.getInstance().getData().definitions).to.deep.equal(
        {}
      );
    });

    it("expect definitions when they defined", () => {
      const models: { [key: string]: ISwaggerBuildDefinitionModel } = {
        Version: {
          properties: {
            id: {
              type: SwaggerDefinitionConstant.Model.Property.Type.STRING
            }
          }
        }
      };

      SwaggerService.getInstance().setDefinitions(models);

      expect(SwaggerService.getInstance().getData().definitions).to.deep.equal({
        Version: {
          properties: {
            id: { type: "string" }
          },
          required: [],
          type: "object"
        }
      });
    });
  });

  describe("setResponses", () => {
    it("should set responses", () => {
      const expected = {
        NotFound: {
          description: "Not Found",
          schema: {
            type: "string"
          }
        }
      };

      SwaggerService.getInstance().setGlobalResponses({
        NotFound: {
          description: "Not Found",
          type: DataType.string
        }
      });

      SwaggerService.getInstance().buildSwagger();

      expect(SwaggerService.getInstance().getData().responses).to.deep.equal(
        expected
      );
    });

    it("should fail when empty response set", () => {
      expect(() => {
        SwaggerService.getInstance().setGlobalResponses({});
      }).to.throw("Cannot be empty");
    });
  });

  describe("addPath", () => {
    const pathArgs: IApiPathArgs = {
      path: "/versions",
      name: "Version"
    };
    const pathTarget: any = {
      name: "VersionsController"
    };
    const operationTarget: any = {
      constructor: {
        name: "VersionsController"
      }
    };

    it("expect new path", () => {
      SwaggerService.getInstance().addPath(pathArgs, pathTarget);

      SwaggerService.getInstance().buildSwagger();
      expect(SwaggerService.getInstance().getData().paths).to.deep.equal({
        "/versions": {}
      });
    });

    describe("addOperationGet", () => {
      let propertyKey: string | symbol;
      let expectedPaths: { [key: string]: ISwaggerPath };

      beforeEach(() => {
        SwaggerService.getInstance().addPath(pathArgs, pathTarget);
      });

      describe("expect string", () => {
        beforeEach(() => {
          propertyKey = "getVersions";
          expectedPaths = {
            "/versions": {
              get: {
                consumes: [SwaggerDefinitionConstant.Consume.JSON],
                operationId: "getVersions",
                produces: [SwaggerDefinitionConstant.Produce.JSON],
                responses: {
                  200: {
                    description: "Success",
                    schema: {
                      type: SwaggerDefinitionConstant.Response.Type.STRING
                    }
                  }
                },
                tags: ["Version"]
              }
            }
          };
        });

        it("expect default", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                type: DataType.string
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect description", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            description: "get versions",
            responses: {
              200: {
                type: DataType.string
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.description =
            operationGetArgs.description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect summary", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            summary: "get versions",
            responses: {
              200: {
                type: DataType.string
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.summary = operationGetArgs.summary;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect tags", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                type: DataType.string
              }
            },
            tags: ["test-tag", "super-tag"]
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.tags = operationGetArgs.tags;
          expectedPaths["/versions"].get.tags.unshift("Version");
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect consumes", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            consumes: [
              SwaggerDefinitionConstant.Consume.JSON,
              SwaggerDefinitionConstant.Consume.XML
            ],
            responses: {
              200: {
                type: DataType.string
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.consumes = operationGetArgs.consumes;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect produces", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            produces: [
              SwaggerDefinitionConstant.Produce.JSON,
              SwaggerDefinitionConstant.Produce.XML
            ],
            responses: {
              200: {
                type: DataType.string
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.produces = operationGetArgs.produces;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect responses", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                description: "return simple string",
                type: DataType.string
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.responses[200].description =
            operationGetArgs.responses[200].description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });
      });

      describe("expect number with float format", () => {
        beforeEach(() => {
          propertyKey = "getVersions";
          expectedPaths = {
            "/versions": {
              get: {
                consumes: [SwaggerDefinitionConstant.Consume.JSON],
                operationId: "getVersions",
                produces: [SwaggerDefinitionConstant.Produce.JSON],
                responses: {
                  200: {
                    description: "Success",
                    schema: {
                      type: SwaggerDefinitionConstant.Response.Type.NUMBER,
                      format: SwaggerDefinitionConstant.Response.Format.FLOAT
                    }
                  }
                },
                tags: ["Version"]
              }
            }
          };
        });

        it("expect default", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                type: DataType.float
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect description", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            description: "get versions",
            responses: {
              200: {
                type: DataType.float
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.description =
            operationGetArgs.description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect summary", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            summary: "get versions",
            responses: {
              200: {
                type: DataType.float
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.summary = operationGetArgs.summary;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect tags", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                type: DataType.float
              }
            },
            tags: ["test-tag", "super-tag"]
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.tags = operationGetArgs.tags;
          expectedPaths["/versions"].get.tags.unshift("Version");
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect consumes", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            consumes: [
              SwaggerDefinitionConstant.Consume.JSON,
              SwaggerDefinitionConstant.Consume.XML
            ],
            responses: {
              200: {
                type: DataType.float
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.consumes = operationGetArgs.consumes;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect produces", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            produces: [
              SwaggerDefinitionConstant.Produce.JSON,
              SwaggerDefinitionConstant.Produce.XML
            ],
            responses: {
              200: {
                type: DataType.float
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.produces = operationGetArgs.produces;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect responses", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                description: "return simple string",
                type: DataType.float
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.responses[200].description =
            operationGetArgs.responses[200].description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });
      });

      describe("expect array", () => {
        beforeEach(() => {
          propertyKey = "getVersions";
          expectedPaths = {
            "/versions": {
              get: {
                consumes: [SwaggerDefinitionConstant.Consume.JSON],
                operationId: "getVersions",
                produces: [SwaggerDefinitionConstant.Produce.JSON],
                responses: {
                  200: {
                    description: "Success",
                    schema: {
                      items: { $ref: "#/definitions/Version" },
                      type: SwaggerDefinitionConstant.Response.Type.ARRAY
                    }
                  }
                },
                tags: ["Version"]
              }
            }
          };
        });

        it("expect default", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                model: "Version",
                type: DataType.array
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect description", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            description: "get versions",
            responses: {
              200: {
                model: "Version",
                type: DataType.array
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.description =
            operationGetArgs.description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect summary", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            summary: "get versions",
            responses: {
              200: {
                model: "Version",
                type: DataType.array
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.summary = operationGetArgs.summary;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect tags", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                model: "Version",
                type: DataType.array
              }
            },
            tags: ["test-tag", "super-tag"]
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.tags = operationGetArgs.tags;
          expectedPaths["/versions"].get.tags.unshift("Version");
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect consumes", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            consumes: [
              SwaggerDefinitionConstant.Consume.JSON,
              SwaggerDefinitionConstant.Consume.XML
            ],
            responses: {
              200: {
                model: "Version",
                type: DataType.array
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.consumes = operationGetArgs.consumes;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect produces", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            produces: [
              SwaggerDefinitionConstant.Produce.JSON,
              SwaggerDefinitionConstant.Produce.XML
            ],
            responses: {
              200: {
                model: "Version",
                type: DataType.array
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.produces = operationGetArgs.produces;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect responses", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            responses: {
              200: {
                description: "return version object",
                model: "Version",
                type: DataType.array
              }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions"].get.responses[200].description =
            operationGetArgs.responses[200].description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });
      });

      describe("expect object", () => {
        beforeEach(() => {
          propertyKey = "getVersion";
          expectedPaths = {
            "/versions/{id}": {
              get: {
                consumes: [SwaggerDefinitionConstant.Consume.JSON],
                operationId: "getVersion",
                produces: [SwaggerDefinitionConstant.Produce.JSON],
                responses: {
                  200: {
                    description: "Success",
                    schema: {
                      $ref: "#/definitions/Version"
                    }
                  }
                },
                tags: ["Version"]
              }
            }
          };
        });

        it("expect default", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            responses: {
              200: { model: "Version" }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect description", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            description: "get version",
            responses: {
              200: { model: "Version" }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions/{id}"].get.description =
            operationGetArgs.description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect summary", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            summary: "get version",
            responses: {
              200: { model: "Version" }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions/{id}"].get.summary =
            operationGetArgs.summary;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect tags", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            responses: {
              200: { model: "Version" }
            },
            tags: ["test-tag", "super-tag"]
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions/{id}"].get.tags = operationGetArgs.tags;
          expectedPaths["/versions/{id}"].get.tags.unshift("Version");
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect consumes", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            consumes: [
              SwaggerDefinitionConstant.Consume.JSON,
              SwaggerDefinitionConstant.Consume.XML
            ],
            responses: {
              200: { model: "Version" }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions/{id}"].get.consumes =
            operationGetArgs.consumes;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect produces", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            produces: [
              SwaggerDefinitionConstant.Produce.JSON,
              SwaggerDefinitionConstant.Produce.XML
            ],
            responses: {
              200: { model: "Version" }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions/{id}"].get.produces =
            operationGetArgs.produces;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });

        it("expect responses", () => {
          const operationGetArgs: IApiOperationGetArgs = {
            path: "/{id}",
            responses: {
              200: { description: "return version object", model: "Version" }
            }
          };

          SwaggerService.getInstance().addOperationGet(
            operationGetArgs,
            operationTarget,
            propertyKey
          );

          SwaggerService.getInstance().buildSwagger();
          expectedPaths["/versions/{id}"].get.responses[200].description =
            operationGetArgs.responses[200].description;
          expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
            expectedPaths
          );
        });
      });
    });

    describe("addOperationPost", () => {
      const propertyKey: string | symbol = "postVersion";
      let expectedPaths: { [key: string]: ISwaggerPath };

      beforeEach(() => {
        SwaggerService.getInstance().addPath(pathArgs, pathTarget);
        expectedPaths = {
          "/versions": {
            post: {
              parameters: [
                {
                  in: SwaggerDefinitionConstant.Parameter.In.BODY,
                  name: SwaggerDefinitionConstant.Parameter.In.BODY,
                  required: true,
                  schema: {
                    $ref: "#/definitions/Version"
                  }
                }
              ],
              consumes: [SwaggerDefinitionConstant.Consume.JSON],
              operationId: propertyKey,
              produces: [SwaggerDefinitionConstant.Produce.JSON],
              responses: {
                200: {
                  description: "Success",
                  schema: {
                    items: {
                      $ref: "#/definitions/Version"
                    },
                    type: SwaggerDefinitionConstant.Response.Type.ARRAY
                  }
                }
              },
              tags: ["Version"]
            }
          }
        };
      });

      it("expect default", () => {
        const argsOperationPost: IApiOperationPostArgs = {
          parameters: {
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version",
              type: DataType.array
            }
          }
        };

        SwaggerService.getInstance().addOperationPost(
          argsOperationPost,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect description", () => {
        const argsOperationPost: IApiOperationPostArgs = {
          description: "post version",
          parameters: {
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version",
              type: DataType.array
            }
          }
        };

        SwaggerService.getInstance().addOperationPost(
          argsOperationPost,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions"].post.description =
          argsOperationPost.description;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect summary", () => {
        const argsOperationPost: IApiOperationPostArgs = {
          summary: "post version",
          parameters: {
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version",
              type: DataType.array
            }
          }
        };

        SwaggerService.getInstance().addOperationPost(
          argsOperationPost,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions"].post.summary = argsOperationPost.summary;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect tags", () => {
        const argsOperationPost: IApiOperationPostArgs = {
          parameters: {
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version",
              type: DataType.array
            }
          },
          tags: ["test-tag", "super-tag"]
        };

        SwaggerService.getInstance().addOperationPost(
          argsOperationPost,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions"].post.tags = argsOperationPost.tags;
        expectedPaths["/versions"].post.tags.unshift("Version");
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect consumes", () => {
        const argsOperationPost: IApiOperationPostArgs = {
          consumes: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version",
              type: DataType.array
            }
          }
        };

        SwaggerService.getInstance().addOperationPost(
          argsOperationPost,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions"].post.consumes = argsOperationPost.consumes;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect produces", () => {
        const argsOperationPost: IApiOperationPostArgs = {
          produces: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version",
              type: DataType.array
            }
          }
        };

        SwaggerService.getInstance().addOperationPost(
          argsOperationPost,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions"].post.produces = argsOperationPost.produces;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });
    });

    describe("addOperationPut", () => {
      const propertyKey: string | symbol = "putVersion";
      let expectedPaths: { [key: string]: ISwaggerPath };

      beforeEach(() => {
        SwaggerService.getInstance().addPath(pathArgs, pathTarget);
        expectedPaths = {
          "/versions/{id}": {
            put: {
              parameters: [
                {
                  in: "path",
                  description: "Id of version",
                  name: "id",
                  required: true,
                  type: SwaggerDefinitionConstant.Parameter.Type.STRING
                },
                {
                  in: SwaggerDefinitionConstant.Parameter.In.BODY,
                  name: SwaggerDefinitionConstant.Parameter.In.BODY,
                  required: true,
                  schema: {
                    $ref: "#/definitions/Version"
                  }
                }
              ],
              consumes: [SwaggerDefinitionConstant.Consume.JSON],
              operationId: propertyKey,
              produces: [SwaggerDefinitionConstant.Produce.JSON],
              responses: {
                200: {
                  description: "Success",
                  schema: {
                    $ref: "#/definitions/Version"
                  }
                }
              },
              tags: ["Version"]
            }
          }
        };
      });

      it("expect default", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPut(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect description", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}",
          description: "post version",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPut(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].put.description =
          argsOperationPut.description;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect summary", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}",
          summary: "post version",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPut(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].put.summary = argsOperationPut.summary;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect tags", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          },
          tags: ["test-tag", "super-tag"]
        };

        SwaggerService.getInstance().addOperationPut(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].put.tags = argsOperationPut.tags;
        expectedPaths["/versions/{id}"].put.tags.unshift("Version");
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect consumes", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}",
          consumes: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPut(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].put.consumes =
          argsOperationPut.consumes;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect produces", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}",
          produces: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPut(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].put.produces =
          argsOperationPut.produces;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });
    });

    describe("addOperationPatch", () => {
      const propertyKey: string | symbol = "patchVersionDescription";
      let expectedPaths: { [key: string]: ISwaggerPath };

      beforeEach(() => {
        SwaggerService.getInstance().addPath(pathArgs, pathTarget);
        expectedPaths = {
          "/versions/{id}/description": {
            patch: {
              parameters: [
                {
                  in: "path",
                  description: "Id of version",
                  name: "id",
                  required: true,
                  type: SwaggerDefinitionConstant.Parameter.Type.STRING
                },
                {
                  in: SwaggerDefinitionConstant.Parameter.In.BODY,
                  name: SwaggerDefinitionConstant.Parameter.In.BODY,
                  required: true,
                  schema: {
                    $ref: "#/definitions/Version"
                  }
                }
              ],
              consumes: [SwaggerDefinitionConstant.Consume.JSON],
              operationId: propertyKey,
              produces: [SwaggerDefinitionConstant.Produce.JSON],
              responses: {
                200: {
                  description: "Success",
                  schema: {
                    $ref: "#/definitions/Version"
                  }
                }
              },
              tags: ["Version"]
            }
          }
        };
      });

      it("expect default", () => {
        const argsOperationPatch: IApiOperationPatchArgs = {
          path: "/{id}/description",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPatch(
          argsOperationPatch,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect description", () => {
        const argsOperationPatch: IApiOperationPutArgs = {
          path: "/{id}/description",
          description: "patch version description",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPatch(
          argsOperationPatch,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}/description"].patch.description =
          argsOperationPatch.description;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect summary", () => {
        const argsOperationPatch: IApiOperationPatchArgs = {
          path: "/{id}/description",
          summary: "patch version description",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPatch(
          argsOperationPatch,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}/description"].patch.summary =
          argsOperationPatch.summary;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect tags", () => {
        const argsOperationPatch: IApiOperationPatchArgs = {
          path: "/{id}/description",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          },
          tags: ["test-tag", "super-tag"]
        };

        SwaggerService.getInstance().addOperationPatch(
          argsOperationPatch,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}/description"].patch.tags =
          argsOperationPatch.tags;
        expectedPaths["/versions/{id}/description"].patch.tags.unshift(
          "Version"
        );
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect consumes", () => {
        const argsOperationPatch: IApiOperationPatchArgs = {
          path: "/{id}/description",
          consumes: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPatch(
          argsOperationPatch,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}/description"].patch.consumes =
          argsOperationPatch.consumes;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect produces", () => {
        const argsOperationPut: IApiOperationPutArgs = {
          path: "/{id}/description",
          produces: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            },
            body: {
              description: "New versions",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: { model: "Version" }
          }
        };

        SwaggerService.getInstance().addOperationPatch(
          argsOperationPut,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}/description"].patch.produces =
          argsOperationPut.produces;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });
    });

    describe("addOperationDelete", () => {
      const propertyKey: string | symbol = "deleteVersion";
      let expectedPaths: { [key: string]: ISwaggerPath };

      beforeEach(() => {
        SwaggerService.getInstance().addPath(pathArgs, pathTarget);
        expectedPaths = {
          "/versions/{id}": {
            delete: {
              consumes: [SwaggerDefinitionConstant.Consume.JSON],
              operationId: propertyKey,
              parameters: [
                {
                  in: "path",
                  description: "Id of version",
                  name: "id",
                  required: true,
                  type: SwaggerDefinitionConstant.Parameter.Type.STRING
                }
              ],
              produces: [SwaggerDefinitionConstant.Produce.JSON],
              responses: {
                200: {
                  description: "Success"
                }
              },
              tags: ["Version"]
            }
          }
        };
      });

      it("expect default", () => {
        const argsOperationDelete: IApiOperationDeleteArgs = {
          path: "/{id}",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            }
          },
          responses: {
            200: { description: "Success" }
          }
        };

        SwaggerService.getInstance().addOperationDelete(
          argsOperationDelete,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect description", () => {
        const argsOperationDelete: IApiOperationDeleteArgs = {
          path: "/{id}",
          description: "delete version",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            }
          },
          responses: {
            200: { description: "Success" }
          }
        };

        SwaggerService.getInstance().addOperationDelete(
          argsOperationDelete,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].delete.description =
          argsOperationDelete.description;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect summary", () => {
        const argsOperationDelete: IApiOperationDeleteArgs = {
          path: "/{id}",
          summary: "delete version",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            }
          },
          responses: {
            200: { description: "Success" }
          }
        };

        SwaggerService.getInstance().addOperationDelete(
          argsOperationDelete,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].delete.summary =
          argsOperationDelete.summary;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect tags", () => {
        const argsOperationDelete: IApiOperationDeleteArgs = {
          path: "/{id}",
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            }
          },
          responses: {
            200: { description: "Success" }
          },
          tags: ["test-tag", "super-tag"]
        };

        SwaggerService.getInstance().addOperationDelete(
          argsOperationDelete,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].delete.tags = argsOperationDelete.tags;
        expectedPaths["/versions/{id}"].delete.tags.unshift("Version");
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect consumes", () => {
        const argsOperationDelete: IApiOperationDeleteArgs = {
          path: "/{id}",
          consumes: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            }
          },
          responses: {
            200: { description: "Success" }
          }
        };

        SwaggerService.getInstance().addOperationDelete(
          argsOperationDelete,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].delete.consumes =
          argsOperationDelete.consumes;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });

      it("expect produces", () => {
        const argsOperationDelete: IApiOperationDeleteArgs = {
          path: "/{id}",
          produces: [
            SwaggerDefinitionConstant.Consume.JSON,
            SwaggerDefinitionConstant.Consume.XML
          ],
          parameters: {
            path: {
              id: {
                description: "Id of version",
                type: SwaggerDefinitionConstant.Parameter.Type.STRING,
                required: true
              }
            }
          },
          responses: {
            200: { description: "Success" }
          }
        };

        SwaggerService.getInstance().addOperationDelete(
          argsOperationDelete,
          operationTarget,
          propertyKey
        );

        SwaggerService.getInstance().buildSwagger();
        expectedPaths["/versions/{id}"].delete.produces =
          argsOperationDelete.produces;
        expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
          expectedPaths
        );
      });
    });
  });

  describe("tags", () => {
    // TODO to be refactored in version 2.0.0

    const target: any = {
      name: "VersionsController",
      constructor: {
        name: "VersionsController"
      }
    };

    it("should be declared two tags", () => {
      SwaggerService.getInstance().addPath(
        {
          path: "/versions",
          name: "Versions"
        },
        target
      );

      SwaggerService.getInstance().addOperationGet(
        {
          description: "Get versions objects list",
          summary: "Get versions list",
          responses: {
            200: {
              type: DataType.array,
              model: "Version"
            }
          }
        },
        target,
        "getVersions"
      );

      SwaggerService.getInstance().addOperationPost(
        {
          description: "Post version object",
          summary: "Post new version",
          parameters: {
            body: {
              description: "New version",
              required: true,
              model: "Version"
            }
          },
          responses: {
            200: {
              model: "Version"
            },
            400: { description: "Parameters fail" }
          },
          tags: ["Authors"]
        },
        target,
        "saveVersion"
      );

      SwaggerService.getInstance().buildSwagger();

      expect(SwaggerService.getInstance().getData().tags).to.deep.equal([
        { name: "Authors" },
        { name: "Versions" }
      ]);
    });

    it("should be declared one distinct tag", () => {
      SwaggerService.getInstance().addPath(
        {
          path: "/versions",
          name: "Versions"
        },
        target
      );

      const newTarget = {
        name: "VersionController",
        constructor: {
          name: "VersionController"
        }
      };

      SwaggerService.getInstance().addPath(
        {
          path: "/versions/{id}",
          name: "Versions"
        },
        newTarget
      );

      SwaggerService.getInstance().addOperationGet(
        {
          description: "Get versions objects list",
          summary: "Get versions list",
          responses: {
            200: {
              type: DataType.array,
              model: "Version"
            }
          }
        },
        target,
        "getVersions"
      );

      SwaggerService.getInstance().addOperationGet(
        {
          description: "Get versions objects list",
          summary: "Get versions list",
          responses: {
            200: {
              type: DataType.array,
              model: "Version"
            }
          }
        },
        newTarget,
        "getVersion"
      );

      SwaggerService.getInstance().buildSwagger();

      expect(SwaggerService.getInstance().getData().tags).to.deep.equal([
        { name: "Versions" }
      ]);
    });
  });

  // TODO in 2.0.0 refactor under operation builder
  describe("operations", () => {
    const pathArgs: IApiPathArgs = {
      path: "/versions",
      name: "Version"
    };
    const pathTarget: any = {
      name: "VersionsController"
    };
    const operationTarget: any = {
      constructor: {
        name: "VersionsController"
      }
    };

    const expectedPaths = {
      "/versions": {
        get: {
          description: "Get versions objects list",
          summary: "Get versions list",
          consumes: [SwaggerDefinitionConstant.Consume.JSON],
          operationId: "getVersions",
          produces: [SwaggerDefinitionConstant.Produce.JSON],
          responses: {
            200: {
              description: "Success",
              schema: {
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                items: {
                  $ref: "#/definitions/Version"
                }
              }
            }
          },
          tags: ["Version"]
        }
      },
      "/versions/:id": {
        get: {
          description: "Get version",
          summary: "Get version",
          consumes: [SwaggerDefinitionConstant.Consume.JSON],
          operationId: "getVersion",
          produces: [SwaggerDefinitionConstant.Produce.JSON],
          responses: {
            200: {
              description: "Success",
              schema: {
                $ref: "#/definitions/Version"
              }
            }
          },
          tags: ["Version"]
        }
      }
    };

    const operationArgs = {
      description: "Get versions objects list",
      summary: "Get versions list",
      responses: {
        200: {
          type: DataType.array,
          model: "Version"
        }
      }
    };

    const operationArgs2 = {
      description: "Get version",
      summary: "Get version",
      path: "/:id",
      responses: {
        200: {
          type: DataType.object,
          model: "Version"
        }
      }
    };

    const opereationArgsSame = {
      description: "Get versions objects list duplicate",
      summary: "Get versions list duplicate",
      responses: {
        200: {
          type: DataType.array,
          model: "Version"
        }
      }
    };

    beforeEach(() => {
      SwaggerService.getInstance().addPath(pathArgs, pathTarget);
    });

    it("should create two get operations", () => {
      SwaggerService.getInstance().addOperationGet(
        operationArgs,
        operationTarget,
        "getVersions"
      );

      SwaggerService.getInstance().addOperationGet(
        operationArgs2,
        operationTarget,
        "getVersion"
      );

      SwaggerService.getInstance().buildSwagger();

      expect(SwaggerService.getInstance().getData().paths).to.deep.equal(
        expectedPaths
      );
    });

    it("should fail when double operations under same path - path undefined", () => {
      SwaggerService.getInstance().addOperationGet(
        operationArgs,
        operationTarget,
        "getVersions"
      );

      expect(() => {
        SwaggerService.getInstance().addOperationGet(
          opereationArgsSame,
          operationTarget,
          "getVersionsDuplicate"
        );
      }).to.throw(
        "Multiple operations defined under target = /versions, path = /, operation = get"
      );
    });

    it("should fail when double operations under same path - path defined", () => {
      SwaggerService.getInstance().addOperationGet(
        operationArgs,
        operationTarget,
        "getVersions"
      );

      const operation: IApiOperationGetArgs = { ...opereationArgsSame };
      operation.path = "/";

      expect(() => {
        SwaggerService.getInstance().addOperationGet(
          operation,
          operationTarget,
          "getVersionsDuplicate"
        );
      }).to.throw(
        "Multiple operations defined under target = /versions, path = /, operation = get"
      );
    });
  });
});
