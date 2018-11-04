import * as _ from "lodash";
import { IOperationObject } from "./operation-object.builder";
import { AbstractPathBuilder } from "./abstract-path-builder";
import { ISwaggerOperationParameter } from "../../i-swagger";
import { ParametersBuilder } from "../parameters.builder";
import { HttpMethod } from "../../swagger-definition.constant";

export interface IPathItemObject {
  parameters?: any[]; // TODO define specific type of parameters to be able to render it correctly
  get?: IOperationObject;
  post?: IOperationObject;
  delete?: IOperationObject;
  patch?: IOperationObject;
  put?: IOperationObject;
  options?: IOperationObject;
  head?: IOperationObject;
  $ref?: string;
}

export interface IOperationObjectWithMethod extends IOperationObject {
  method: HttpMethod;
}

export class PathItemObjectBuilder extends AbstractPathBuilder {
  constructor(
    private parametersBuilder: ParametersBuilder = new ParametersBuilder()
  ) {
    super();
  }

  private pathItemObject: IPathItemObject = {};
  private parameters: ISwaggerOperationParameter[] = [];

  public withParameters(
    parameters: ISwaggerOperationParameter[]
  ): PathItemObjectBuilder {
    if (this.pathItemObject.$ref) {
      throw new Error(
        "Unable to define parameters. Unsupported modification of path item object defined as $ref"
      );
    }

    if (!_.isEmpty(parameters)) {
      this.parameters = parameters;
    }

    return this;
  }

  public withOperation(
    operation: IOperationObjectWithMethod
  ): PathItemObjectBuilder {
    if (_.has(this.pathItemObject, operation.method)) {
      throw new Error(`Method "${operation.method}" already defined`);
    }

    // reduce to not hold method in result
    this.pathItemObject[operation.method] = _.omit(operation, "method");

    return this;
  }

  public merge(pathItemObject: IPathItemObject): PathItemObjectBuilder {
    if (_.isEmpty(pathItemObject)) {
      return this;
    }

    if (PathItemObjectBuilder.isRef(this.pathItemObject)) {
      throw new Error(
        "Unsupported modification of path item object defined as $ref."
      );
    }

    if (PathItemObjectBuilder.isInvalid(pathItemObject)) {
      throw new Error("Illegal state of path item object.");
    }

    this.pathItemObject = _.assign(this.pathItemObject, pathItemObject);
    return this;
  }

  public asRef($ref: string): PathItemObjectBuilder {
    if (
      !PathItemObjectBuilder.isRef(this.pathItemObject) &&
      PathItemObjectBuilder.isSet(this.pathItemObject)
    ) {
      throw new Error(
        "Unable to set as reference while operations or parameters are set."
      );
    }

    if (_.isEmpty($ref)) {
      throw new Error("$ref value cannot be empty.");
    }

    this.pathItemObject.$ref = $ref;
    return this;
  }

  public build(): IPathItemObject {
    if (!_.isEmpty(this.parameters)) {
      const parametersBuilder = this.parametersBuilder;
      parametersBuilder.fromParameters(this.parameters);
      this.pathItemObject.parameters = parametersBuilder.build();
    }

    return this.pathItemObject;
  }

  public reset(): PathItemObjectBuilder {
    this.parameters = [];
    this.pathItemObject = {};
    this.parametersBuilder.reset();
    return this;
  }

  private static isRef(pathItemObject: IPathItemObject): boolean {
    return _.has(pathItemObject, "$ref");
  }

  private static isInvalid(pathItemObject: IPathItemObject): boolean {
    const keys = _.keys(pathItemObject).length;

    return (
      keys === 0 || (PathItemObjectBuilder.isRef(pathItemObject) && keys > 1)
    );
  }

  private static isSet(pathItemObject: IPathItemObject): boolean {
    return _.keys(pathItemObject).length > 0;
  }
}
