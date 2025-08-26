import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderId: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  buyer: {
    email: string;
    name: string;
  };

  @Prop({ required: true, type: [Object] })
  items: Array<{
    sku: string;
    qty: number;
    price: number;
  }>;

  @Prop({ type: Object })
  attachment?: {
    filename: string;
    contentType: string;
    size: number;
    storageKey: string;
  };

  @Prop({ required: true, default: 'PENDING' })
  status: 'PENDING' | 'PAID' | 'CANCELLED';

  @Prop({ required: true })
  total: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Compound index for idempotency
OrderSchema.index({ tenantId: 1, requestId: 1 }, { unique: true });
