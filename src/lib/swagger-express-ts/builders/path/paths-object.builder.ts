import {
  IPathItemObject,
  PathItemObjectBuilder
} from "./path-item-object.builder";
import { IApiArgs } from "../../decorators/api.decorator";
import { IOperationObjectArgs } from "./operation-object.builder";
import * as _ from "lodash";
import { AbstractPathBuilder } from "./abstract-path-builder";

export interface IPathsObject {
  [key: string]: IPathItemObject;
}

export class PathsObjectBuilder extends AbstractPathBuilder {
  constructor(
    private pathItemObjectBuilder: PathItemObjectBuilder = new PathItemObjectBuilder()
  ) {
    super();
  }

  private pathsTree: any = {};
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

    const builder: PathItemObjectBuilder = this.pathItemObjectBuilder.reset();

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
    this.registerPath(apiArgs.path);

    return this;
  }

  public withOperation(
    operationWrapper: IOperationObjectArgs
  ): PathsObjectBuilder {
    const args = operationWrapper.args;
    let path = args.resource;
    const operation = operationWrapper.operation;

    if (!_.isEmpty(args.path)) {
      if (!PathsObjectBuilder.startsWithSlash(args.path)) {
        throw new Error(
          `Path has to start with "/" symbol. Actual = "${
            args.path
          }". Should be "/${args.path}"`
        );
      }

      if (args.path !== "/") {
        path = path.concat(args.path);
      }
    }

    const builder: PathItemObjectBuilder = this.pathItemObjectBuilder.reset();
    if (this.containsPath(path)) {
      const item = this.paths[path];
      if (PathsObjectBuilder.isReference(item)) {
        throw new Error(
          `Unable to add operation when resource "${path}" defined as $ref`
        );
      }
      builder.merge(item);
    }

    this.checkPossibleDuplicate(path);

    builder.withOperation({ method: args.method, ...operation });

    this.paths[path] = builder.build();
    this.registerPath(path);

    return this;
  }

  public build(): IPathsObject {
    return _.pickBy(this.paths, it => !_.isEmpty(it));
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

  private checkPossibleDuplicate(path: string) {
    let parts: string | string[] = path.substring(1);
    parts = parts.split("/");

    let subTree = this.pathsTree;
    let resource = "";
    _.each(parts, (part: string) => {
      if (PathsObjectBuilder.isWildcard(part) && !_.isEmpty(subTree)) {
        throw new Error(
          `Possible duplicate with resource = "${resource}/${
            Object.keys(subTree)[0]
          }" sub-resource = "${path}"`
        );
      }
      subTree = subTree[part];
      resource = `${resource}/${part}`;
    });
  }

  private static isWildcard(part: string): boolean {
    return (
      part.indexOf(":") > -1 || part.indexOf("{") > -1 || part.indexOf("}") > -1
    );
  }

  private registerPath(path: string) {
    let parts: string | string[] = path.substring(1);
    parts = parts.split("/");

    let subTree = this.pathsTree;
    _.each(parts, (part: string) => {
      if (!subTree[part]) {
        subTree[part] = {};
      }
      subTree = subTree[part];
    });
  }
}
