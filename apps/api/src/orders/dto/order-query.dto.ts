import { IsString, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class OrderQueryDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'PAID' | 'CANCELLED';

  @IsOptional()
  @IsString()
  buyerEmail?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
