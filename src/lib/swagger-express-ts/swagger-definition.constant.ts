export class SwaggerDefinitionConstant {
  public static JSON: string = "application/json";
  public static XML: string = "application/xml";
  public static ZIP: string = "application/zip";
  public static PDF: string = "application/pdf";
  public static X_WWW_FORM_URLENCODED: string = "application/x-www-form-urlencoded";
  public static FORM_DATA: string = "multipart/form-data";
  public static TEXT_PLAIN: string = "text/plain";
  public static TEXT_HTML: string = "text/html";
  public static PNG: string = "image/png";
  public static GIF: string = "image/gif";
  public static JPEG: string = "image/jpeg";
  public static STRING: string = "string";
  public static NUMBER: string = "number";
  public static INTEGER: string = "integer";
  public static BOOLEAN: string = "boolean";
  public static ARRAY: string = "array";
  public static OBJECT: string = "object";
  public static QUERY: string = "query";
  public static FLOAT: string = "float";
  public static DOUBLE: string = "double";
  public static INT_32: string = "int32";
  public static INT_64: string = "int64";
  public static BYTE: string = "byte";
  public static BINARY: string = "binary";
  public static DATE: string = "date";
  public static DATE_TIME: string = "date-time";
  public static PASSWORD: string = "password";
  public static FILE: string = "file";

  public static Produce = {
    JSON: SwaggerDefinitionConstant.JSON,
    XML: SwaggerDefinitionConstant.XML,
    ZIP: SwaggerDefinitionConstant.ZIP,
    PDF: SwaggerDefinitionConstant.PDF,
    X_WWW_FORM_URLENCODED: SwaggerDefinitionConstant.X_WWW_FORM_URLENCODED,
    FORM_DATA: SwaggerDefinitionConstant.FORM_DATA,
    TEXT_PLAIN: SwaggerDefinitionConstant.TEXT_PLAIN,
    TEXT_HTML: SwaggerDefinitionConstant.TEXT_HTML,
    PNG: SwaggerDefinitionConstant.PNG,
    GIF: SwaggerDefinitionConstant.GIF,
    JPEG: SwaggerDefinitionConstant.JPEG
  };

  public static Consume = {
    XML: SwaggerDefinitionConstant.XML,
    JSON: SwaggerDefinitionConstant.JSON
  };

  public static Model = {
    Type: {
      OBJECT: SwaggerDefinitionConstant.OBJECT,
      ARRAY: SwaggerDefinitionConstant.ARRAY
    },
    Property: {
      Type: {
        STRING: SwaggerDefinitionConstant.STRING,
        NUMBER: SwaggerDefinitionConstant.NUMBER,
        INTEGER: SwaggerDefinitionConstant.INTEGER,
        BOOLEAN: SwaggerDefinitionConstant.BOOLEAN,
        ARRAY: SwaggerDefinitionConstant.ARRAY,
        OBJECT: SwaggerDefinitionConstant.OBJECT
      },
      ItemType: {
        STRING: SwaggerDefinitionConstant.STRING,
        NUMBER: SwaggerDefinitionConstant.NUMBER,
        INTEGER: SwaggerDefinitionConstant.INTEGER,
        BOOLEAN: SwaggerDefinitionConstant.BOOLEAN
      },
      Format: {
        FLOAT: SwaggerDefinitionConstant.FLOAT,
        DOUBLE: SwaggerDefinitionConstant.DOUBLE,
        INT_32: SwaggerDefinitionConstant.INT_32,
        INT_64: SwaggerDefinitionConstant.INT_64
      }
    }
  };

  public static Parameter = {
    Type: {
      STRING: SwaggerDefinitionConstant.STRING,
      NUMBER: SwaggerDefinitionConstant.NUMBER,
      INTEGER: SwaggerDefinitionConstant.INTEGER,
      BOOLEAN: SwaggerDefinitionConstant.BOOLEAN,
      ARRAY: SwaggerDefinitionConstant.ARRAY,
      OBJECT: SwaggerDefinitionConstant.OBJECT
    },
    In: {
      PATH: "path",
      QUERY: SwaggerDefinitionConstant.QUERY,
      BODY: "body",
      FORM_DATA: "formData"
    }
  };

  public static Response = {
    Type: {
      STRING: SwaggerDefinitionConstant.STRING,
      NUMBER: SwaggerDefinitionConstant.NUMBER,
      INTEGER: SwaggerDefinitionConstant.INTEGER,
      BOOLEAN: SwaggerDefinitionConstant.BOOLEAN,
      ARRAY: SwaggerDefinitionConstant.ARRAY,
      OBJECT: SwaggerDefinitionConstant.OBJECT
    },
    Format: {
      FLOAT: SwaggerDefinitionConstant.FLOAT,
      DOUBLE: SwaggerDefinitionConstant.DOUBLE,
      INT_32: SwaggerDefinitionConstant.INT_32,
      INT_64: SwaggerDefinitionConstant.INT_64
    }
  };

  public static HTTP_STATUSES = {
    200: "Success",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    406: "Not Acceptable",
    500: "Internal Server Error",
    501: "Not Implemented",
    503: "Service Unavailable"
  };

  /**
   * @see {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat}
   */
  public static DATA_TYPES = {
    integer: {
      type: SwaggerDefinitionConstant.INTEGER,
      format: SwaggerDefinitionConstant.INT_32
    },
    long: {
      type: SwaggerDefinitionConstant.INTEGER,
      format: SwaggerDefinitionConstant.INT_64
    },
    float: {
      type: SwaggerDefinitionConstant.NUMBER,
      format: SwaggerDefinitionConstant.FLOAT
    },
    double: {
      type: SwaggerDefinitionConstant.NUMBER,
      format: SwaggerDefinitionConstant.DOUBLE
    },
    string: {
      type: SwaggerDefinitionConstant.STRING
    },
    byte: {
      type: SwaggerDefinitionConstant.STRING,
      format: SwaggerDefinitionConstant.BYTE
    },
    binary: {
      type: SwaggerDefinitionConstant.STRING,
      format: SwaggerDefinitionConstant.BINARY
    },
    boolean: {
      type: SwaggerDefinitionConstant.BOOLEAN
    },
    date: {
      type: SwaggerDefinitionConstant.STRING,
      format: SwaggerDefinitionConstant.DATE
    },
    dateTime: {
      type: SwaggerDefinitionConstant.STRING,
      format: SwaggerDefinitionConstant.DATE_TIME
    },
    password: {
      type: SwaggerDefinitionConstant.STRING,
      format: SwaggerDefinitionConstant.PASSWORD
    },
    file: {
      type: SwaggerDefinitionConstant.FILE
    }
  };

  public static Security = {
    Type: {
      BASIC_AUTHENTICATION: "basic",
      API_KEY: "apiKey",
      BEARER: "Bearer",
      OAUTH2: "OAuth2",
      OPENID: "OpenID"
    },
    In: {
      HEADER: "header",
      QUERY: SwaggerDefinitionConstant.QUERY
    }
  };
}

export enum DataType {
  integer,
  long,
  float,
  double,
  string,
  byte,
  binary,
  boolean,
  date,
  dateTime,
  password,
  object,
  array,
  file
}

export enum SwaggerScheme {
  HTTP = "http",
  HTTPS = "https",
  WS = "ws",
  WSS = "wss"
}

export enum SwaggerMimeType {
  APPLICATION_ATOM_XML = "application/atom+xml",
  APPLICATION_FORM_URLENCODED = "application/x-www-form-urlencoded",
  APPLICATION_JSON = "application/json",
  APPLICATION_JSON_UTF8 = "application/json;charset=UTF-8",
  APPLICATION_OCTET_STREAM = 'application/octet-stream"',
  APPLICATION_PDF = "application/pdf",
  APPLICATION_PROBLEM_JSON = "application/problem+json",
  APPLICATION_PROBLEM_JSON_UTF8 = "application/problem+json;charset=UTF-8",
  APPLICATION_PROBLEM_XML = "application/problem+xml",
  APPLICATION_RSS_XML = "application/rss+xml",
  APPLICATION_STREAM_JSON = "application/stream+json",
  APPLICATION_XHTML_XML = "application/xhtml+xml",
  APPLICATION_XML = "application/xml",
  IMAGE_GIF = "image/gif",
  IMAGE_JPEG = "image/jpeg",
  IMAGE_PNG = "image/png",
  MULTIPART_FORM_DATA = "multipart/form-data",
  TEXT_EVENT_STREAM = "text/event-stream",
  TEXT_HTML = "text/html",
  TEXT_MARKDOWN = "text/markdown",
  TEXT_PLAIN = "text/plain",
  TEXT_XML = "text/xml"
}
