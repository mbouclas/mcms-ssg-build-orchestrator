import { IsNotEmpty, IsNumber } from "class-validator";

export class BuildPayloadDto {
  @IsNotEmpty() token: string;
  @IsNotEmpty() id: string;
  @IsNotEmpty() jobId: number;
}
