import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Buyer {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  name: string;
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true, type: String })
  sku: string;

  @Prop({ required: true, type: Number, min: 1 })
  qty: number;

  @Prop({ required: true, type: Number, min: 0.01 })
  price: number;
}

@Schema({ _id: false })
export class Attachment {
  @Prop({ required: true, type: String })
  filename: string;

  @Prop({ required: true, type: String })
  contentType: string;

  @Prop({ required: true, type: Number, min: 1, max: 10 * 1024 * 1024 })
  size: number;

  @Prop({ required: true, type: String })
  storageKey: string;
}

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, type: String })
  orderId: string;

  @Prop({ required: true, type: String })
  requestId: string;

  @Prop({ required: true, type: String })
  tenantId: string;

  @Prop({ required: true, type: Buyer })
  buyer: Buyer;

  @Prop({ required: true, type: [OrderItem] })
  items: OrderItem[];

  @Prop({ type: Attachment })
  attachment?: Attachment;

  @Prop({ required: true, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING', type: String })
  status: string;

  @Prop({ required: true, type: Number, min: 0 })
  total: number;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ tenantId: 1, requestId: 1 }, { unique: true });
OrderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ tenantId: 1, 'buyer.email': 1 });
OrderSchema.index({ tenantId: 1, createdAt: -1 });
