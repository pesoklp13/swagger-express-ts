import * as _ from "lodash";

export abstract class AbstractPathBuilder {
  protected static startsWithSlash(path: string): boolean {
    return !_.isEmpty(path) && path.startsWith("/");
  }
}
