import { IApiOperationArgs } from "../../decorators/api.decorator";
import { ISwaggerOperationResponse } from "../../i-swagger";

export interface IApiOperationArgsForResource extends IApiOperationArgs {
  resource: string;
}

export interface IOperationObjectArgs {
  args: IApiOperationArgsForResource;
  operation: IOperationObject;
}

export interface IOperationObject {
  operationId?: string;
  responses: {
    [key: string]: ISwaggerOperationResponse;
  };
}

export class OperationObjectBuilder {
  public build(): IOperationObject {
    return { responses: {} };
  }

  public withArguments(args: IApiOperationArgs): OperationObjectBuilder {
    return this;
  }

  public withOperationId(operationId: string): OperationObjectBuilder {
    return this;
  }
}
