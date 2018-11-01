import {
  IPathItemObject,
  PathItemObjectBuilder
} from "./path-item-object.builder";
import { IApiArgs } from "../../decorators/api.decorator";
import { IOperationObject } from "./operation-object.builder";
import * as _ from "lodash";

export interface IPathsObject {
  [key: string]: IPathItemObject;
}

export class PathsObjectBuilder {
  private paths: IPathsObject = {};

  public withPath(apiArgs: IApiArgs): PathsObjectBuilder {
    if (!PathsObjectBuilder.startsWithSlash(apiArgs.path)) {
      throw new Error(
        `Path has to start with "/" symbol. Actual = "${
          apiArgs.path
        }". Should be "/${apiArgs.path}"`
      );
    }

    if (this.containsPath(apiArgs.path)) {
      throw new Error(`Duplicate mapping key "${apiArgs.path}"`);
    }

    const builder: PathItemObjectBuilder = new PathItemObjectBuilder();
    builder.forPath(apiArgs.path);

    if (PathsObjectBuilder.hasParameters(apiArgs)) {
      if (apiArgs.$ref) {
        throw new Error(
          `Unable to set parameters for path item object when defined as $ref for path = "${
            apiArgs.path
          }"`
        );
      }

      builder.withParameters(apiArgs.parameters);
    }

    if (apiArgs.$ref) {
      builder.asRef(apiArgs.$ref);
    }

    this.paths[apiArgs.path] = builder.build();
    return this;
  }

  public withOperation(operation: IOperationObject): PathsObjectBuilder {
    let path = operation.resource;

    if (!_.isEmpty(operation.path)) {
      if (!PathsObjectBuilder.startsWithSlash(operation.path)) {
        throw new Error(
          `Path has to start with "/" symbol. Actual = "${
            operation.path
          }". Should be "/${operation.path}"`
        );
      }

      if (operation.path !== "/") {
        path = path.concat(operation.path);
      }
    }

    const builder: PathItemObjectBuilder = new PathItemObjectBuilder();
    if (this.containsPath(path)) {
      const item = this.paths[path];
      if (PathsObjectBuilder.isReference(item)) {
        throw new Error(
          `Unable to add operation when resource "${path}" defined as $ref`
        );
      }
      builder.merge(item);
    }

    builder.withOperation(operation);

    this.paths[path] = builder.build();
    return this;
  }

  public build(): IPathsObject {
    return _.pickBy(this.paths, it => !_.isEmpty(it));
  }

  private static startsWithSlash(path: string): boolean {
    return !_.isEmpty(path) && path.startsWith("/");
  }

  private containsPath(path: string): boolean {
    return this.paths[path] !== undefined;
  }

  private static hasParameters(apiArgs: IApiArgs) {
    return !_.isEmpty(apiArgs.parameters) || _.isArray(apiArgs.parameters);
  }

  private static isReference(pathItemObject: IPathItemObject): boolean {
    return pathItemObject.$ref !== undefined;
  }
}
