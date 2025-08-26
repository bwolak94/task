import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderReadDocument = OrderRead & Document;

@Schema({ timestamps: true })
export class OrderRead {
  @Prop({ required: true, unique: true })
  orderId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  buyerEmail: string;

  @Prop({ required: true, default: 'PENDING' })
  status: 'PENDING' | 'PAID' | 'CANCELLED';

  @Prop({ required: true })
  total: number;

  @Prop({ type: Object })
  attachment?: {
    filename: string;
    storageKey: string;
  };

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const OrderReadSchema = SchemaFactory.createForClass(OrderRead);

// Indexes for filtering and pagination
OrderReadSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
OrderReadSchema.index({ tenantId: 1, buyerEmail: 1 });
OrderReadSchema.index({ tenantId: 1, createdAt: -1 });
