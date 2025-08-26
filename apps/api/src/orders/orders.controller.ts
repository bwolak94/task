import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CreateOrderCommand } from './commands/create-order.command';
import { GetOrdersQuery } from './queries/get-orders.query';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const { requestId, tenantId, buyer, items, attachment } = createOrderDto;

    const result = await this.commandBus.execute(
      new CreateOrderCommand(requestId, tenantId, buyer, items, attachment),
    );

    return result;
  }

  @Get()
  async getOrders(@Query() query: OrderQueryDto) {
    const result = await this.queryBus.execute(
      new GetOrdersQuery(
        query.tenantId,
        query.status,
        query.buyerEmail,
        query.from,
        query.to,
        query.page,
        query.limit,
      ),
    );

    return result;
  }
}
