import {IOperationObject} from "./operation-object.builder";

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

export class PathItemObjectBuilder {

  public forPath(path: string): PathItemObjectBuilder {
    return this;
  }

  public withParameters(parameters: any[]): PathItemObjectBuilder {
    return this;
  }

  public withOperation(operation: IOperationObject): PathItemObjectBuilder {
    return this;
  }

  public merge(pathItemObject: IPathItemObject): PathItemObjectBuilder {
    return this;
  }

  public asRef($ref: string): PathItemObjectBuilder {
    return this;
  }

  public build(): IPathItemObject {
    return {};
  }
}
