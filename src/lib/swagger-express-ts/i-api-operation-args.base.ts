import { DataType } from "./swagger-definition.constant";

export interface IApiOperationArgsBaseParameter {
  description?: string;
  type?: string;
  required?: boolean;
  format?: string;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  model?: string;
}

export interface IApiOperationArgsBaseResponse {
  description?: string;
  headers?: { [key: string]: IApiOperationArgsBaseResponseHeader };
  type?: DataType;
  model?: string | DataType;
}

export interface IApiOperationArgsBaseResponseHeader {
  type: string;
  description: string;
}

export interface IApiOperationArgsBaseParameters {
  path?: { [key: string]: IApiOperationArgsBaseParameter };
  query?: { [key: string]: IApiOperationArgsBaseParameter };
  body?: IApiOperationArgsBaseParameter; // use only for POST, PUT and PATCH
  formData?: { [key: string]: IApiOperationArgsBaseParameter };
}

export interface IApiOperationArgsBase {
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
}
