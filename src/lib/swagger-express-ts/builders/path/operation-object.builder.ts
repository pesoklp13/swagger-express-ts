import {IApiOperationArgs} from "../../decorators/api.decorator";
import {HttpMethod} from "../../swagger-definition.constant";

export interface IOperationObject {
  path: string;
  method: HttpMethod
}

export class OperationObjectBuilder {
  public build(): IOperationObject {
    return { path: "", method: HttpMethod.GET };
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
