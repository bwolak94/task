import { IEvent } from '@nestjs/cqrs';

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly buyer: {
      email: string;
      name: string;
    },
    public readonly items: Array<{
      sku: string;
      qty: number;
      price: number;
    }>,
    public readonly total: number,
    public readonly attachment?: {
      filename: string;
      contentType: string;
      size: number;
    },
  ) {}
}
