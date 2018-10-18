import {
  ISwagger,
  ISwaggerDefinition,
  ISwaggerDefinitionProperty,
  ISwaggerExternalDocs,
  ISwaggerInfo,
  ISwaggerOperation,
  ISwaggerOperationParameter,
  ISwaggerPath,
  ISwaggerTag,
  SWAGGER_VERSION
} from "./i-swagger";
import { IApiPathArgs } from "./api-path.decorator";
import { IApiOperationPostArgs } from "./api-operation-post.decorator";
import {
  SwaggerDefinitionConstant,
  SwaggerScheme
} from "./swagger-definition.constant";
import * as _ from "lodash";
import {
  IApiOperationArgsBase,
  IApiOperationArgsBaseParameter,
  IApiOperationArgsBaseResponse
} from "./i-api-operation-args.base";
import { IApiOperationGetArgs } from "./api-operation-get.decorator";
import { IApiModelPropertyArgs } from "./api-model-property.decorator";
import { IApiModelArgs } from ".";
import * as assert from "assert";
import {
  ISwaggerBuildDefinitionModel,
  ISwaggerBuildDefinitionModelProperty,
  ISwaggerSecurityDefinition
} from "./swagger.builder";
import { ReferenceBuilder } from "./builders/reference.builder";
import { ResponseBuilder } from "./builders/response.builder";
import {
  Pattern,
  PatternEnum,
  Validate
} from "./decorators/validate.decorator";
import { InfoObjectBuilder } from "./builders/info-object.builder";

type OperationMethods = "get" | "post" | "put" | "patch" | "delete";

interface IPath {
  path?: string;
  get?: ISwaggerOperation;
  post?: ISwaggerOperation;
  put?: ISwaggerOperation;
  patch?: ISwaggerOperation;
  delete?: ISwaggerOperation;
}

interface IController {
  path?: string;
  paths?: { [key: string]: IPath };
  name?: string;
  description?: string;
  security?: { [key: string]: any[] };
  deprecated?: boolean;
}

export class SwaggerService {
  public static getInstance(): SwaggerService {
    if (!SwaggerService.instance) {
      const newSwaggerService: SwaggerService = new SwaggerService();
      newSwaggerService.initData();
      SwaggerService.instance = newSwaggerService;
    }
    return SwaggerService.instance;
  }

  private static instance: SwaggerService;
  private controllerMap: IController[] = [];
  private data: ISwagger;
  private modelsMap: { [key: string]: ISwaggerBuildDefinitionModel } = {};

  private constructor(
    private refBuilder: ReferenceBuilder = new ReferenceBuilder(),
    private responseBuilder: ResponseBuilder = new ResponseBuilder(),
    private infoBuilder: InfoObjectBuilder = new InfoObjectBuilder()
  ) {}

  public withInfoBuilder(infoBuilder: InfoObjectBuilder): SwaggerService {
    this.infoBuilder = infoBuilder;
    return this;
  }

  public resetData(): void {
    this.controllerMap = [];
    this.initData();
  }

  public getData(): ISwagger {
    return _.cloneDeep(this.data);
  }

  public setBasePath(basePath: string): void {
    this.data.basePath = basePath;
  }

  public setOpenapi(openapi: string): void {
    this.data.openapi = openapi;
  }

  public setInfo(info: ISwaggerInfo): void {
    this.infoBuilder.withDefaultValues(info.title, info.version);
    this.infoBuilder.withDescription(info.description);
    this.infoBuilder.withTermsOfService(info.termsOfService);

    if (info.contact) {
      this.infoBuilder.withContact(info.contact);
    }

    if (info.license) {
      this.infoBuilder.withLicense(info.license);
    }

    this.data.info = this.infoBuilder.build();
  }

  public setSchemes(schemes: SwaggerScheme[]): void {
    this.data.schemes = schemes;
  }

  public setProduces(produces: string[]): void {
    this.data.produces = produces;
  }

  public setConsumes(consumes: string[]): void {
    this.data.consumes = consumes;
  }

  @Validate
  public setHost(
    @Pattern({ pattern: PatternEnum.HOST, path: "host" })
    host: string
  ): void {
    this.data.host = host;
  }

  public setDefinitions(models: {
    [key: string]: ISwaggerBuildDefinitionModel;
  }): void {
    const definitions: { [key: string]: ISwaggerDefinition } = {};
    for (const modelIndex in models) {
      if (models.hasOwnProperty(modelIndex)) {
        const model: ISwaggerBuildDefinitionModel = models[modelIndex];
        const newDefinition: ISwaggerDefinition = {
          type: SwaggerDefinitionConstant.Model.Type.OBJECT,
          properties: {},
          required: []
        };
        if (model.description) {
          newDefinition.description = model.description;
        }
        for (const propertyIndex in model.properties) {
          if (model.properties.hasOwnProperty(propertyIndex)) {
            const property: ISwaggerBuildDefinitionModelProperty =
              model.properties[propertyIndex];
            const newProperty: ISwaggerDefinitionProperty = {
              type: property.type
            };
            if (property.format) {
              newProperty.format = property.format;
            }

            if (property.description) {
              newProperty.description = property.description;
            }

            if (property.enum) {
              newProperty.enum = property.enum;
            }
            if (property.itemType) {
              newProperty.items = {
                type: property.itemType
              };
            }
            if (property.model) {
              if (
                _.isEqual(
                  SwaggerDefinitionConstant.Model.Property.Type.ARRAY,
                  property.type
                )
              ) {
                newProperty.items = {
                  $ref: this.refBuilder.withValue(property.model).build()
                };
              } else {
                newProperty.$ref = this.refBuilder
                  .withValue(property.model)
                  .build();
              }
            }
            if (property.required) {
              newDefinition.required.push(propertyIndex);
            }
            newDefinition.properties[propertyIndex] = newProperty;

            definitions[modelIndex] = newDefinition;
          }
        }
      }
    }
    this.data.definitions = _.mergeWith(this.data.definitions, definitions);
  }

  @Validate
  public setExternalDocs(
    @Pattern({ pattern: PatternEnum.URI, path: "url" })
    externalDocs: ISwaggerExternalDocs
  ): void {
    this.data.externalDocs = externalDocs;
  }

  public setGlobalResponses(globalResponses: {
    [key: string]: IApiOperationArgsBaseResponse;
  }): void {
    this.data.responses = this.responseBuilder
      .withResponses(globalResponses)
      .build();
  }

  public addPath(args: IApiPathArgs, target: any): void {
    let currentController: IController = {
      path: args.path,
      name: args.name,
      paths: {}
    };
    for (const controllerIndex in this.controllerMap) {
      if (this.controllerMap[controllerIndex]) {
        const controller: IController = this.controllerMap[controllerIndex];
        if (controllerIndex === target.name) {
          currentController = controller;
          currentController.path = args.path;
          currentController.name = args.name;
          currentController.description = args.description;
          currentController.security = args.security;
          currentController.deprecated = args.deprecated;
        }
      }
    }
    this.controllerMap[target.name] = _.mergeWith(
      this.controllerMap[target.name],
      currentController
    );
  }

  public addOperationGet(
    args: IApiOperationGetArgs,
    target: any,
    propertyKey: string | symbol
  ): void {
    assert.ok(args, "Args are required.");
    assert.ok(args.responses, "Responses are required.");
    if (args.parameters) {
      assert.ok(!args.parameters.body, "Parameter body is not required.");
    }
    this.addOperation("get", args, target, propertyKey);
  }

  public addOperationPost(
    args: IApiOperationPostArgs,
    target: any,
    propertyKey: string | symbol
  ): void {
    assert.ok(args, "Args are required.");
    assert.ok(args.parameters, "Parameters are required.");
    assert.ok(args.responses, "Responses are required.");
    this.addOperation("post", args, target, propertyKey);
  }

  public addOperationPut(
    args: IApiOperationPostArgs,
    target: any,
    propertyKey: string | symbol
  ): void {
    assert.ok(args, "Args are required.");
    assert.ok(args.parameters, "Parameters are required.");
    assert.ok(args.responses, "Responses are required.");
    this.addOperation("put", args, target, propertyKey);
  }

  public addOperationPatch(
    args: IApiOperationPostArgs,
    target: any,
    propertyKey: string | symbol
  ): void {
    assert.ok(args, "Args are required.");
    assert.ok(args.parameters, "Parameters are required.");
    assert.ok(args.responses, "Responses are required.");
    this.addOperation("patch", args, target, propertyKey);
  }

  public addOperationDelete(
    args: IApiOperationPostArgs,
    target: any,
    propertyKey: string | symbol
  ): void {
    assert.ok(args, "Args are required.");
    assert.ok(args.parameters, "Parameters are required.");
    assert.ok(!args.parameters.body, "Parameter body is not required.");
    assert.ok(args.responses, "Responses are required.");
    this.addOperation("delete", args, target, propertyKey);
  }

  public addSecurityDefinitions(securityDefinitions: {
    [key: string]: ISwaggerSecurityDefinition;
  }): void {
    this.data.securityDefinitions = securityDefinitions;
  }

  public buildSwagger(): void {
    const data: ISwagger = _.cloneDeep(this.data);
    for (const controllerIndex in this.controllerMap) {
      if (this.controllerMap[controllerIndex]) {
        const controller: IController = this.controllerMap[controllerIndex];
        if (_.toArray(controller.paths).length > 0) {
          for (const pathIndex in controller.paths) {
            if (controller.paths.hasOwnProperty(pathIndex)) {
              const path: IPath = controller.paths[pathIndex];
              const swaggerPath: ISwaggerPath = {};
              if (path.get) {
                swaggerPath.get = this.buildSwaggerOperation(
                  path.get,
                  controller
                );
              }
              if (path.post) {
                swaggerPath.post = this.buildSwaggerOperation(
                  path.post,
                  controller
                );
              }
              if (path.put) {
                swaggerPath.put = this.buildSwaggerOperation(
                  path.put,
                  controller
                );
              }
              if (path.patch) {
                swaggerPath.patch = this.buildSwaggerOperation(
                  path.patch,
                  controller
                );
              }
              if (path.delete) {
                swaggerPath.delete = this.buildSwaggerOperation(
                  path.delete,
                  controller
                );
              }

              if (path.path && path.path.length > 0) {
                data.paths[controller.path.concat(path.path)] = swaggerPath;
              } else {
                data.paths[controller.path] = swaggerPath;
              }
            }
          }
        } else {
          data.paths[controller.path] = {};
        }
        const tag: ISwaggerTag = {
          name: controller.name
        };

        if (controller.description) {
          tag.description = controller.description;
        }

        this.addTag(data.tags, tag);
      }
    }

    this.data = data;
    this.data.tags = Array.from(this.data.tags);
  }

  public addApiModel(args: IApiModelArgs, target: any): any {
    const definitionKey = target.name;
    let swaggerBuildDefinitionModel: ISwaggerBuildDefinitionModel = this
      .modelsMap[definitionKey];
    if (!swaggerBuildDefinitionModel) {
      swaggerBuildDefinitionModel = {
        properties: {}
      };
      this.modelsMap[definitionKey] = swaggerBuildDefinitionModel;
    }
    if (args) {
      swaggerBuildDefinitionModel.description = args.description;
      if (args.name) {
        const name: string = _.upperFirst(args.name);
        this.modelsMap[name] = _.cloneDeep(this.modelsMap[definitionKey]);
        if (!_.isEqual(name, definitionKey)) {
          delete this.modelsMap[definitionKey];
          delete this.data.definitions[definitionKey];
        }
      }
    }
    this.setDefinitions(this.modelsMap);
  }

  public addApiModelProperty(
    args: IApiModelPropertyArgs,
    target: any,
    propertyKey: string | symbol,
    propertyType: string
  ) {
    const definitionKey = target.constructor.name;
    let swaggerBuildDefinitionModel: ISwaggerBuildDefinitionModel = this
      .modelsMap[definitionKey];
    if (!swaggerBuildDefinitionModel) {
      swaggerBuildDefinitionModel = {
        properties: {}
      };
      this.modelsMap[definitionKey] = swaggerBuildDefinitionModel;
    }

    const swaggerBuildDefinitionModelProperty: ISwaggerBuildDefinitionModelProperty = {
      type: _.lowerCase(propertyType)
    };
    if (args) {
      swaggerBuildDefinitionModelProperty.required = args.required;
      swaggerBuildDefinitionModelProperty.description = args.description;
      swaggerBuildDefinitionModelProperty.enum = args.enum;
      swaggerBuildDefinitionModelProperty.itemType = args.itemType;
      if (args.model) {
        swaggerBuildDefinitionModelProperty.model = args.model;
        if (!_.isEqual("Array", propertyType)) {
          swaggerBuildDefinitionModelProperty.type = undefined;
        }
      }
      if (args.type) {
        swaggerBuildDefinitionModelProperty.type = args.type;
      }
    }
    swaggerBuildDefinitionModel.properties[
      propertyKey.toString()
    ] = swaggerBuildDefinitionModelProperty;
    this.setDefinitions(this.modelsMap);
  }

  private addOperation(
    operation: OperationMethods,
    args: IApiOperationArgsBase,
    target: any,
    propertyKey: string | symbol
  ): void {
    let currentController: IController = {
      paths: {}
    };

    for (const index in this.controllerMap) {
      if (this.controllerMap[index]) {
        const controller = this.controllerMap[index];
        if (index === target.constructor.name) {
          currentController = controller;
        }
      }
    }

    let currentPath: IPath;

    let path;
    if (args.path && args.path.length > 0) {
      path = args.path;
      currentPath = { path };
    } else {
      path = "/";
    }

    if (currentController.paths[path]) {
      if ((currentController.paths[path] as any)[operation]) {
        {
          throw new Error(
            "Multiple operations defined under target = "
              .concat(currentController.path)
              .concat(", path = ")
              .concat(path)
              .concat(", operation = ")
              .concat(operation)
          );
        }
      }
    } else {
      currentController.paths[path] = {};
    }

    currentPath = _.mergeWith(currentController.paths[path], currentPath);

    (currentPath as any)[operation] = this.buildOperation(args, propertyKey);
    this.controllerMap[target.constructor.name] = currentController;
    _.map(args.tags, tag => ({ name: _.upperFirst(tag) })).forEach(tag =>
      this.addTag(this.data.tags, tag)
    );
  }

  @Validate
  private addTag(
    tags: ISwaggerTag[],
    @Pattern({ pattern: PatternEnum.URI, path: "externalDocs", nullable: true })
    tag: ISwaggerTag
  ) {
    if (!_.some(tags, tag)) {
      tags.push(tag);
    }
  }

  private buildOperation(
    args: IApiOperationArgsBase,
    propertyKey: string | symbol
  ): ISwaggerOperation {
    const operation: ISwaggerOperation = {
      operationId: propertyKey,
      tags: []
    };
    if (args.description) {
      operation.description = args.description;
    }
    if (args.summary) {
      operation.summary = args.summary;
    }
    if (args.produces && args.produces.length > 0) {
      operation.produces = args.produces;
    }

    if (args.consumes && args.consumes.length > 0) {
      operation.consumes = args.consumes;
    }

    if (args.tags && args.tags.length > 0) {
      operation.tags = args.tags;
    }

    if (args.deprecated) {
      operation.deprecated = args.deprecated;
    }

    if (args.parameters) {
      operation.parameters = [];
      if (args.parameters.path) {
        operation.parameters = _.concat(
          operation.parameters,
          SwaggerService.buildParameters(
            SwaggerDefinitionConstant.Parameter.In.PATH,
            args.parameters.path
          )
        );
      }
      if (args.parameters.query) {
        operation.parameters = _.concat(
          operation.parameters,
          SwaggerService.buildParameters(
            SwaggerDefinitionConstant.Parameter.In.QUERY,
            args.parameters.query
          )
        );
      }
      if (args.parameters.body) {
        assert.ok(args.parameters.body.model, "Definition are required.");
        const newParameterBody: ISwaggerOperationParameter = {
          name: SwaggerDefinitionConstant.Parameter.In.BODY,
          in: SwaggerDefinitionConstant.Parameter.In.BODY
        };
        if (args.parameters.body.required) {
          newParameterBody.required = true;
        }

        newParameterBody.schema = {
          $ref: this.refBuilder.withValue(args.parameters.body.model).build()
        };
        operation.parameters.push(newParameterBody);
      }
      if (args.parameters.formData) {
        operation.parameters = _.concat(
          operation.parameters,
          SwaggerService.buildParameters(
            SwaggerDefinitionConstant.Parameter.In.FORM_DATA,
            args.parameters.formData
          )
        );
      }
    }

    if (args.responses) {
      operation.responses = this.responseBuilder
        .withResponses(args.responses)
        .build();
    }

    if (args.security) {
      operation.security = SwaggerService.buildOperationSecurity(args.security);
    }

    return operation;
  }

  private static buildOperationSecurity(argsSecurity: {
    [key: string]: any[];
  }): Array<{ [key: string]: any[] }> {
    const securityToReturn = [];
    for (const securityIndex in argsSecurity) {
      if (argsSecurity.hasOwnProperty(securityIndex)) {
        const security: any[] = argsSecurity[securityIndex];
        const result: { [key: string]: any[] } = {};
        result[securityIndex] = security;
        securityToReturn.push(result);
      }
    }
    return securityToReturn;
  }

  private static buildParameters(
    type: string,
    parameters: { [key: string]: IApiOperationArgsBaseParameter }
  ): ISwaggerOperationParameter[] {
    const swaggerOperationParameter: ISwaggerOperationParameter[] = [];
    for (const parameterIndex in parameters) {
      if (parameters.hasOwnProperty(parameterIndex)) {
        const parameter: IApiOperationArgsBaseParameter =
          parameters[parameterIndex];
        const newSwaggerOperationParameter: ISwaggerOperationParameter = {
          name: parameterIndex,
          in: type,
          type: parameter.type
        };
        if (parameter.description) {
          newSwaggerOperationParameter.description = parameter.description;
        }
        if (parameter.required) {
          newSwaggerOperationParameter.required = true;
        }
        if (parameter.format) {
          newSwaggerOperationParameter.format = parameter.format;
        }
        if (parameter.deprecated) {
          newSwaggerOperationParameter.deprecated = true;
        }
        if (parameter.allowEmptyValue) {
          newSwaggerOperationParameter.allowEmptyValue = true;
        }
        swaggerOperationParameter.push(newSwaggerOperationParameter);
      }
    }
    return swaggerOperationParameter;
  }

  private buildSwaggerOperation(
    operation: ISwaggerOperation,
    controller: IController
  ): ISwaggerOperation {
    if (_.isUndefined(operation.produces)) {
      operation.produces = this.data.produces;
    }
    if (_.isUndefined(operation.consumes)) {
      operation.consumes = this.data.consumes;
    }
    if (_.isUndefined(operation.security) && controller.security) {
      operation.security = SwaggerService.buildOperationSecurity(
        controller.security
      );
    }
    if (_.isUndefined(operation.deprecated) && controller.deprecated) {
      operation.deprecated = controller.deprecated;
    }

    if (!operation.tags) {
      operation.tags = [];
    }

    operation.tags.unshift(_.upperFirst(controller.name));

    return operation;
  }

  private initData(): void {
    this.data = {
      basePath: "/",
      info: {
        title: "Generated swagger project",
        version: "1.0.0"
      },
      paths: {},
      tags: [],
      schemes: [SwaggerScheme.HTTP],
      produces: [SwaggerDefinitionConstant.Produce.JSON],
      consumes: [SwaggerDefinitionConstant.Consume.JSON],
      definitions: {},
      swagger: SWAGGER_VERSION
    };
  }
}
