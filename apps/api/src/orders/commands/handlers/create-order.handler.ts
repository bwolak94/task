import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderCommand } from '../create-order.command';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { OrderCreatedEvent } from '../../events/order-created.event';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<{ orderId: string }> {
    const { requestId, tenantId, buyer, items, attachment } = command;

    const existingOrder = await this.orderModel.findOne({
      tenantId,
      requestId,
    });

    if (existingOrder) {
      return { orderId: existingOrder.orderId };
    }

    const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData: any = {
      orderId,
      requestId,
      tenantId,
      buyer,
      items,
      status: 'PENDING',
      total,
    };

    if (attachment) {
      const storageKey = `tenants/${tenantId}/orders/${orderId}/${attachment.filename}`;
      orderData.attachment = {
        ...attachment,
        storageKey,
      };
    }

    const order = new this.orderModel(orderData);
    await order.save();

    this.eventBus.publish(new OrderCreatedEvent(orderId, tenantId, buyer, items, total, attachment));

    return { orderId };
  }
}
