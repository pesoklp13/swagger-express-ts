import { ResponseBuilder } from "./response.builder";
import * as chai from "chai";
import {
  DataType,
  SwaggerDefinitionConstant
} from "../swagger-definition.constant";
import { ISwaggerOperationResponse } from "../i-swagger";

const expect = chai.expect;

describe("ResponseBuilder", () => {
  const responseBuilder = new ResponseBuilder();

  it("should fail when empty responses set", () => {
    expect(() => {
      responseBuilder.withResponses({});
    }).to.throw("Cannot be empty");
  });

  describe("description", () => {
    it("should return empty object", () => {
      expect(responseBuilder.build()).to.be.deep.equal({});
    });

    it("should return response with explicit description", () => {
      const expected = {
        200: {
          description: "test description"
        }
      };

      const response = {
        description: "test description"
      };
      responseBuilder.withResponses({ 200: response });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    });

    it("should return response with default description", () => {
      const expected = {
        200: {
          description: SwaggerDefinitionConstant.HTTP_STATUSES["200"]
        }
      };

      responseBuilder.withResponses({ 200: {} });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    });

    it("should fail when set undefined statusCode and no description", () => {
      responseBuilder.withResponses({ 111: {} });
      expect(() => responseBuilder.build()).to.be.throw(
        "Response object' description property is required"
      );
    });
  });

  describe("response headers", () => {
    it("should return response with explicit headers", () => {
      const expected = {
        200: {
          description: "this is a test response",
          headers: {
            "x-test-header": {
              type: "string",
              description: "this is a test header"
            }
          }
        }
      };

      const response = {
        description: "this is a test response",
        headers: {
          "x-test-header": {
            type: "string",
            description: "this is a test header"
          }
        }
      };
      responseBuilder.withResponses({ 200: response });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    });
  });

  /**
   * @see {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject}
   */
  describe("schema", () => {
    function assertScalarTypes(
      type: string,
      commonType: DataType,
      format?: string
    ) {
      const responseDefinition: ISwaggerOperationResponse = {
        description: "test description",
        schema: {
          type
        }
      };

      const expected = {
        200: responseDefinition
      };

      if (format) {
        expected["200"].schema.format = format;
      }

      const response = {
        description: "test description",
        type: commonType
      };

      responseBuilder.withResponses({ 200: response });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    }

    it("should set schema with for integer - type integer, format int32", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.INTEGER,
        DataType.integer,
        SwaggerDefinitionConstant.INT_32
      );
    });

    it("should set schema with for long - type integer, format int64", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.INTEGER,
        DataType.long,
        SwaggerDefinitionConstant.INT_64
      );
    });

    it("should set schema with for float - type number, format float", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.NUMBER,
        DataType.float,
        SwaggerDefinitionConstant.FLOAT
      );
    });

    it("should set schema with for double - type number, format double", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.NUMBER,
        DataType.double,
        SwaggerDefinitionConstant.DOUBLE
      );
    });

    it("should set schema with for string", () => {
      assertScalarTypes(SwaggerDefinitionConstant.STRING, DataType.string);
    });

    it("should set schema with for byte - type string, format byte", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.STRING,
        DataType.byte,
        SwaggerDefinitionConstant.BYTE
      );
    });

    it("should set schema with for binary - type string, format binary", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.STRING,
        DataType.binary,
        SwaggerDefinitionConstant.BINARY
      );
    });

    it("should set schema with for boolean", () => {
      assertScalarTypes(SwaggerDefinitionConstant.BOOLEAN, DataType.boolean);
    });

    it("should set schema with for date - type string, format date", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.STRING,
        DataType.date,
        SwaggerDefinitionConstant.DATE
      );
    });

    it("should set schema with for dateTime - type string, format date-time", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.STRING,
        DataType.dateTime,
        SwaggerDefinitionConstant.DATE_TIME
      );
    });

    it("should set schema with for password - type string, format password", () => {
      assertScalarTypes(
        SwaggerDefinitionConstant.STRING,
        DataType.password,
        SwaggerDefinitionConstant.PASSWORD
      );
    });

    it("should set schema for file", () => {
      assertScalarTypes(SwaggerDefinitionConstant.FILE, DataType.file);
    });

    it("should set schema with $ref", () => {
      const expected = {
        200: {
          description: "test description",
          schema: {
            $ref: "#/definitions/Model"
          }
        }
      };

      const response = {
        description: "test description",
        model: "model"
      };

      responseBuilder.withResponses({ 200: response });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    });

    it("should set schema as array of string", () => {
      const expected = {
        200: {
          description: "test description",
          schema: {
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      };

      const response = {
        description: "test description",
        model: DataType.string,
        type: DataType.array
      };

      responseBuilder.withResponses({ 200: response });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    });

    it("should set schema as array of $ref", () => {
      const expected = {
        200: {
          description: "test description",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/Model"
            }
          }
        }
      };

      const response = {
        description: "test description",
        model: "model",
        type: DataType.array
      };

      responseBuilder.withResponses({ 200: response });
      expect(responseBuilder.build()).to.be.deep.equal(expected);
    });
  });
});
