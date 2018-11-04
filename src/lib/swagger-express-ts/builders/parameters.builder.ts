import { IReferenceObject } from "./reference.builder";
import { ISwaggerOperationParameter } from "../i-swagger";

export interface IParameterObject {
  // TODO define structure based of openapi definition
}

export enum ParametersTypeEnum {
  ARRAY,
  DEFINITION
}

export type ParameterOrReferenceType = IParameterObject | IReferenceObject;

export type ParametersType =
  | ParameterOrReferenceType[]
  | { [key: string]: IParameterObject };

// TODO implement
export class ParametersBuilder {
  private buildType = ParametersTypeEnum.ARRAY;

  public asDefinition(): ParametersBuilder {
    this.buildType = ParametersTypeEnum.DEFINITION;
    return this;
  }

  public fromParameters(
    parameters: ISwaggerOperationParameter[]
  ): ParametersBuilder {
    return this;
  }

  public withParameter(
    parameter: ISwaggerOperationParameter
  ): ParametersBuilder {
    return this;
  }

  public build<T extends ParametersType>(): T {
    if (this.buildType === ParametersTypeEnum.DEFINITION) {
      return this.buildAsDefinition() as T;
    }

    return this.buildAsArray() as T;
  }

  public reset(): ParametersBuilder {
    this.buildType = ParametersTypeEnum.ARRAY;

    return this;
  }

  private buildAsArray(): ParameterOrReferenceType[] {
    return [];
  }

  private buildAsDefinition(): { [key: string]: IParameterObject } {
    return {};
  }
}
