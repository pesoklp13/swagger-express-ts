import { IPathItemObject } from "./path-item-object.builder";
import { IApiArgs } from "../../decorators/api.decorator";
import { IOperationObject } from "./operation-object.builder";

export interface IPathsObject {
  [key: string]: IPathItemObject | string;
}

export class PathsObjectBuilder {
  constructor() {
    console.log();
  }

  private paths: IPathsObject = {};

  public withPath(apiArgs: IApiArgs): PathsObjectBuilder {
    // TODO check if not exists yet
    // TODO add parameters if they are set
    // TODO do not allow create item if path is reference

    this.paths[apiArgs.path] = null;
    return this;
  }

  public withOperation(operation: IOperationObject): PathsObjectBuilder {
    // TODO use PathItemObjectBuilder to add operation into item object

    this.paths[operation.path] = null;
    return this;
  }

  public build(): IPathsObject {
    return this.paths;
  }
}
