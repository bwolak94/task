import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetOrdersQuery } from '../get-orders.query';
import { OrderRead, OrderReadDocument } from '../../schemas/order-read.schema';

export interface GetOrdersResult {
  items: Array<{
    orderId: string;
    status: string;
    createdAt: Date;
    buyerEmail: string;
    total: number;
    attachment?: {
      filename: string;
      storageKey: string;
    };
  }>;
  page: number;
  limit: number;
  total: number;
}

@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  constructor(
    @InjectModel(OrderRead.name) private orderReadModel: Model<OrderReadDocument>,
  ) {}

  async execute(query: GetOrdersQuery): Promise<GetOrdersResult> {
    const { tenantId, status, buyerEmail, from, to, page, limit } = query;

    // Build filter
    const filter: any = { tenantId };

    if (status) {
      filter.status = status;
    }

    if (buyerEmail) {
      filter.buyerEmail = buyerEmail;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.orderReadModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderReadModel.countDocuments(filter),
    ]);

    return {
      items: items.map(item => ({
        orderId: item.orderId,
        status: item.status,
        createdAt: item.createdAt,
        buyerEmail: item.buyerEmail,
        total: item.total,
        attachment: item.attachment,
      })),
      page,
      limit,
      total,
    };
  }
}
