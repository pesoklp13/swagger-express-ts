import {
  ApiModel,
  ApiModelProperty,
  SwaggerDefinitionConstant
} from "../lib/swagger-express-ts";

@ApiModel({
  description: "Description Author.",
  name: "Author"
})
export class AuthorModel {
  @ApiModelProperty({
    description: "Id of author",
    example: 1,
    required: true
  })
  public id: string | number;

  @ApiModelProperty({
    description: "Name of author",
    example: "John Doe",
    required: true,
    itemType: SwaggerDefinitionConstant.Model.Property.Type.STRING
  })
  public name: string[];
}
