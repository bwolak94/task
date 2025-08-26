import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class PresignUploadDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsNumber()
  @Min(1)
  @Max(10 * 1024 * 1024) // 10MB max
  size: number;
}
