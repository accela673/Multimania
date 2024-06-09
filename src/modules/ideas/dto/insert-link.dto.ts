import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl } from "class-validator";
import { BaseDto } from "src/base/dto/base.dto.";

export class InsertLinkDto extends BaseDto{
    @ApiProperty({example:'https://drive.google.com/file/d/1qssfZtsb5A7LlfPtk4LtX3KttQxx4GD_/view?usp=sharing'})
    @IsNotEmpty()
    @IsUrl()
    link: string
}