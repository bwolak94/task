import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderCommand } from '../create-order.command';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { OrderCreatedEvent } from '../../events/order-created.event';
import { ConflictException } from '@nestjs/common';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<{ orderId: string }> {
    const { requestId, tenantId, buyer, items, attachment } = command;

    // Check for existing order (idempotency)
    const existingOrder = await this.orderModel.findOne({
      tenantId,
      requestId,
    });

    if (existingOrder) {
      return { orderId: existingOrder.orderId };
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

    // Create new order
    const orderId = `ord_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
    
    const order = new this.orderModel({
      orderId,
      requestId,
      tenantId,
      buyer,
      items,
      attachment,
      total,
      status: 'PENDING',
    });

    await order.save();

    // Emit event
    this.eventBus.publish(
      new OrderCreatedEvent(orderId, tenantId, {
        buyer,
        items,
        total,
        attachment,
      }),
    );

    return { orderId };
  }
}
