import {
  IApiOperationArgsBaseParameters,
  IApiOperationArgsBaseResponse
} from "../i-api-operation-args.base";
import { SwaggerService } from "../swagger.service";
import {OperationObjectBuilder} from "../builders/path/operation-object.builder";
import {HttpMethod} from "../swagger-definition.constant";

export interface IApiArgs {
  /**
   * A relative path to an individual endpoint. The field name MUST begin with a slash.
   * The path is appended to the basePath in order to construct the full URL. Path templating is allowed.
   * Path templating refers to the usage of curly braces ({}) to mark a section of a URL path as replaceable using path parameters.
   */
  path: string;
  /**
   *
   * reference of Path Item Object definition from external source
   *
   * @see $ref of https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#path-item-object
   */
  $ref?: string;
  /**
   * A list of parameters that are applicable for all the operations described under this path.
   */
  parameters?: any[]; // TODO define proper parameter structure to be used
}

export interface IApiOperationArgs {
  /**
   * Define description
   * Optional.
   */
  description?: string;

  /**
   * Define summary
   * Optional.
   */
  summary?: string;

  /**
   * Define produces
   * Optional.
   */
  produces?: string[];

  /**
   * Define consumes
   * Optional.
   */
  consumes?: string[];

  /**
   * Define tags
   * Optional.
   */
  tags?: string[];

  /**
   * Define path
   * Optional.
   */
  path?: string;

  /**
   * Define parameters
   * Optional.
   */
  parameters?: IApiOperationArgsBaseParameters;

  /**
   * Define responses
   */
  responses: { [key: string]: IApiOperationArgsBaseResponse };

  /**
   * Define security
   * Optional.
   */
  security?: { [key: string]: any[] };

  /**
   * Define deprecated
   * Optional.
   */
  deprecated?: boolean;

    /**
     * Define http method for given operation
     */
  method: HttpMethod;
}

export const PATH = Symbol("API_PATH");

/**
 *
 * covers decorator used to proper generation of Paths Object and Path Item Object
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathItemObject
 *
 * @param args
 * @constructor
 */
export function Api(args: IApiArgs): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(PATH, args, target);
    SwaggerService.getInstance()
      .getPathsBuilder()
      .withPath(args);
  };
}

export function ApiOperation(args: IApiOperationArgs): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const pathArgs: IApiArgs =
      Reflect.getOwnMetadata(PATH, target) || undefined;

    if (!pathArgs) {
      throw Error(
        "Class "
          .concat(target.constructor.name)
          .concat(' has to be annotated with @Api({path: "/{path}"})')
      );
    }

      const operationBuilder = new OperationObjectBuilder()
          .forResource(pathArgs.path)
          .withOperationId(propertyKey as string)
          .withArguments(args);

    SwaggerService.getInstance().getPathsBuilder().withOperation(operationBuilder.build());
  };
}
