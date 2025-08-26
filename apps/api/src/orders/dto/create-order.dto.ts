import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, ValidateNested, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BuyerDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class AttachmentDto {
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

  @IsString()
  @IsNotEmpty()
  storageKey: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsNotEmpty()
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
