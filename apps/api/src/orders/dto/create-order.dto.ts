import { IsString, IsEmail, IsNumber, IsArray, IsOptional, Min, Max, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class BuyerDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

export class OrderItemDto {
  @IsString()
  sku: string;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsNumber()
  @Min(0.01)
  price: number;
}

export class AttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsNumber()
  @Min(1)
  @Max(10 * 1024 * 1024)
  size: number;
}

export class CreateOrderDto {
  @IsString()
  requestId: string;

  @IsString()
  tenantId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BuyerDto)
  buyer: BuyerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AttachmentDto)
  attachment?: AttachmentDto;
}
