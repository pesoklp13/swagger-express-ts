import { ApiModel, ApiModelProperty } from "../lib/swagger-express-ts";
import { AuthorModel } from "../author/author.model";

@ApiModel({
  description: "Version description",
  name: "Version"
})
export class VersionModel {
  @ApiModelProperty({
    description: "Id of version",
    example: 1,
    required: true
  })
  public id: string | number;

  @ApiModelProperty({
    description: "",
    example: "New version",
    required: true
  })
  public name: string;

  @ApiModelProperty({
    description: "Description of version",
    example: "My awesome description",
    required: true
  })
  public description: string;

  @ApiModelProperty({
    description: "Author of version",
    model: "Author"
  })
  public author: AuthorModel;
}
