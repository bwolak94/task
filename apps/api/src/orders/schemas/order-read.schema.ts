import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class AttachmentRead {
  @Prop({ required: true, type: String })
  filename: string;

  @Prop({ required: true, type: String })
  storageKey: string;
}

export type OrderReadDocument = OrderRead & Document;

@Schema({ timestamps: true })
export class OrderRead {
  @Prop({ required: true, unique: true, type: String })
  orderId: string;

  @Prop({ required: true, type: String })
  tenantId: string;

  @Prop({ required: true, type: String })
  buyerEmail: string;

  @Prop({ required: true, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING', type: String })
  status: string;

  @Prop({ required: true, type: Number, min: 0 })
  total: number;

  @Prop({ type: AttachmentRead })
  attachment?: AttachmentRead;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const OrderReadSchema = SchemaFactory.createForClass(OrderRead);

OrderReadSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
OrderReadSchema.index({ tenantId: 1, buyerEmail: 1 });
OrderReadSchema.index({ tenantId: 1, createdAt: -1 });
