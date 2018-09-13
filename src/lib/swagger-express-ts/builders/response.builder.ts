import {
  DataType,
  IApiOperationArgsBaseResponse
} from "../i-api-operation-args.base";
import {
  ISwaggerOperationResponse,
  ISwaggerOperationSchema
} from "../i-swagger";
import { SwaggerDefinitionConstant } from "../swagger-definition.constant";
import { ReferenceBuilder } from "./reference.builder";

export class ResponseBuilder {
  private responses: { [statusCode: string]: IApiOperationArgsBaseResponse };
  private refBuilder: ReferenceBuilder = new ReferenceBuilder();

  public withResponses(responses: {
    [statusCode: string]: IApiOperationArgsBaseResponse;
  }) {
    this.responses = responses;
    return this;
  }

  public build(): {
    [key: string]: ISwaggerOperationResponse;
  } {
    const swaggerOperationResponses: {
      [key: string]: ISwaggerOperationResponse;
    } = {};
    for (const responseIndex in this.responses) {
      if (this.responses.hasOwnProperty(responseIndex)) {
        const response: IApiOperationArgsBaseResponse = this.responses[
          responseIndex
        ];
        const newSwaggerOperationResponse: ISwaggerOperationResponse = {
          description: null
        };

        ResponseBuilder.handleResponseDescription(
          response,
          newSwaggerOperationResponse,
          +responseIndex
        );

        if (response.model) {
          newSwaggerOperationResponse.schema = this.createResponseByModel(
            response
          );
        } else if (DataType[response.type]) {
          newSwaggerOperationResponse.schema = ResponseBuilder.createResponseByType(
            response
          );
        }

        swaggerOperationResponses[responseIndex] = newSwaggerOperationResponse;
      }
    }
    return swaggerOperationResponses;
  }

  private static handleResponseDescription(
    response: IApiOperationArgsBaseResponse,
    newSwaggerOperationResponse: ISwaggerOperationResponse,
    statusCode: number
  ) {
    if (response.description) {
      newSwaggerOperationResponse.description = response.description;
    } else {
      const description = (SwaggerDefinitionConstant.HTTP_STATUSES as {
        [key: number]: string;
      })[statusCode];
      if (!description) {
        throw new Error("Response object' description property is required");
      }

      console.warn("Description for response is set implicitly"); // maybe can be provided some configuration info if use it
      newSwaggerOperationResponse.description = description;
    }
  }

  private static createResponseByType(
    response: IApiOperationArgsBaseResponse
  ): ISwaggerOperationSchema {
    switch (response.type) {
      case DataType.array:
      case DataType.object:
        throw new Error("Invalid response schema for type " + response.type);
      default:
        return (SwaggerDefinitionConstant.DATA_TYPES as any)[
          DataType[response.type]
        ];
    }
  }

  private createResponseByModel(
    response: IApiOperationArgsBaseResponse
  ): ISwaggerOperationSchema {
    let newSwaggerOperationResponseSchema: ISwaggerOperationSchema;
    switch (response.type) {
      case DataType.array:
        newSwaggerOperationResponseSchema = {
          type: SwaggerDefinitionConstant.ARRAY,
          items: {}
        };
        if (typeof response.model === "string") {
          newSwaggerOperationResponseSchema.items.$ref = this.refBuilder
            .withValue(response.model as string)
            .build();
        } else {
          newSwaggerOperationResponseSchema.items = (SwaggerDefinitionConstant.DATA_TYPES as any)[
            DataType[response.model]
          ];
        }
        break;
      default:
        newSwaggerOperationResponseSchema = {
          $ref: this.refBuilder.withValue(response.model as string).build()
        };
    }

    return newSwaggerOperationResponseSchema;
  }
}
