export interface IPathItemObject {
  parameters?: any[]; // TODO define specific type of parameters to be able to render it correctly
}

export class PathItemObjectBuilder {
  public build(): IPathItemObject {
    return {};
  }
}
