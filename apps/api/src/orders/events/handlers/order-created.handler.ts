import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderCreatedEvent } from '../order-created.event';
import { OrderRead, OrderReadDocument } from '../../schemas/order-read.schema';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  constructor(
    @InjectModel(OrderRead.name) private orderReadModel: Model<OrderReadDocument>,
  ) {}

  async handle(event: OrderCreatedEvent) {
    const { orderId, tenantId, payload } = event;

    // Create read model (projection)
    const orderRead = new this.orderReadModel({
      orderId,
      tenantId,
      buyerEmail: payload.buyer.email,
      status: 'PENDING',
      total: payload.total,
      attachment: payload.attachment ? {
        filename: payload.attachment.filename,
        storageKey: payload.attachment.storageKey,
      } : undefined,
    });

    await orderRead.save();

    // Simulate status change after 2-5 seconds
    setTimeout(async () => {
      await this.orderReadModel.updateOne(
        { orderId },
        { status: 'PAID' }
      );
    }, 2000 + Math.random() * 3000);
  }
}
