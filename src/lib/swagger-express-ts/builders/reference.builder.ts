import * as _ from "lodash";

export enum ReferenceType {
    definitions,
    responses
}

export class ReferenceBuilder {

    constructor(private referenceType: ReferenceType = ReferenceType.definitions) {

    }

    private referenceValue: string;

    public withValue(value: string) {
        this.referenceValue = value;
        return this;
    }

    public withType(type: ReferenceType) {
        this.referenceType = type;
        return this;
    }

    // TODO
    // public forDefinitions
    // public forResponses

    public build(): string {
        return "#/".concat(ReferenceType[this.referenceType]).concat("/").concat(_.upperFirst(this.referenceValue));
    }
}