import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderCreatedEvent } from '../order-created.event';
import { OrderRead, OrderReadDocument } from '../../schemas/order-read.schema';
import { OrderStatusChangedEvent } from '../order-status-changed.event';
import { EventBus } from '@nestjs/cqrs';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  constructor(
    @InjectModel(OrderRead.name) private orderReadModel: Model<OrderReadDocument>,
    private eventBus: EventBus,
  ) {}

  async handle(event: OrderCreatedEvent) {
    const { orderId, tenantId, buyer, items, attachment, total } = event;

    const orderRead = new this.orderReadModel({
      orderId,
      tenantId,
      buyerEmail: buyer.email,
      status: 'PENDING',
      total,
      attachment: attachment ? {
        filename: attachment.filename,
        storageKey: `tenants/${tenantId}/orders/${orderId}/${attachment.filename}`,
      } : undefined,
    });

    await orderRead.save();

    setTimeout(() => {
      this.eventBus.publish(new OrderStatusChangedEvent(orderId, tenantId, {
        status: 'PAID',
        previousStatus: 'PENDING',
      }));
    }, 2000 + Math.random() * 3000);
  }
}
