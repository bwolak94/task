import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderRead, OrderReadSchema } from './schemas/order-read.schema';
import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { GetOrdersHandler } from './queries/handlers/get-orders.handler';
import { OrderCreatedHandler } from './events/handlers/order-created.handler';

const CommandHandlers = [CreateOrderHandler];
const QueryHandlers = [GetOrdersHandler];
const EventHandlers = [OrderCreatedHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderRead.name, schema: OrderReadSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class OrdersModule {}
