import { SwaggerMimeType } from "../swagger-definition.constant";
import {
  NotEmpty,
  PatternEnum,
  Validate,
  validatePattern
} from "../decorators/validate.decorator";
import * as _ from "lodash";

export class MimeTypeUtil {
  private static ENUM_VALUES = _.invert(SwaggerMimeType);

  @Validate
  public static valueOf(
    @NotEmpty() type: SwaggerMimeType | string
  ): SwaggerMimeType | string {
    if (typeof type === "string") {
      if (MimeTypeUtil.isVendorType(type)) {
        return type;
      }

      return MimeTypeUtil.toMimeType(type);
    }

    return type;
  }

  @Validate
  public static isVendorType(@NotEmpty() type: string): boolean {
    const typeWithoutCharset = type.split(";")[0];

    try {
      validatePattern(typeWithoutCharset, { pattern: PatternEnum.MIME_TYPE });
    } catch (e) {
      return false;
    }

    const parts = typeWithoutCharset.split("/");
    return parts[1].startsWith("vnd.");
  }

  @Validate
  public static toMimeType(@NotEmpty() type: string): SwaggerMimeType {
    if (type === "*/*") {
      throw new Error(
        "Unsupported MimeType */*. Use specific MimeType instead"
      );
    }

    const value = (SwaggerMimeType as any)[MimeTypeUtil.ENUM_VALUES[type]];
    if (value) {
      return value;
    }

    throw new Error('Unsupported MimeType "'.concat(type).concat('"'));
  }
}
