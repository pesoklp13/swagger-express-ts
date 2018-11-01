import { IApiOperationArgs } from "../../decorators/api.decorator";
import { HttpMethod } from "../../swagger-definition.constant";
import { ISwaggerOperationResponse } from "../../i-swagger";

export interface IOperationObject {
  resource: string;
  path?: string;
  method: HttpMethod;
  operationId?: string;
  responses: {
    [key: string]: ISwaggerOperationResponse;
  };
}

export class OperationObjectBuilder {
  public build(): IOperationObject {
    return { resource: "/", method: HttpMethod.GET, responses: {} };
  }

  public forResource(path: string): OperationObjectBuilder {
    return this;
  }

  public withArguments(args: IApiOperationArgs): OperationObjectBuilder {
    return this;
  }

  public withOperationId(operationId: string): OperationObjectBuilder {
    return this;
  }
}
