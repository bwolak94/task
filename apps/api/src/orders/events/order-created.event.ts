import { IEvent } from '@nestjs/cqrs';

export class OrderCreatedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly payload: {
      buyer: {
        email: string;
        name: string;
      };
      items: Array<{
        sku: string;
        qty: number;
        price: number;
      }>;
      total: number;
      attachment?: {
        filename: string;
        contentType: string;
        size: number;
        storageKey: string;
      };
    },
  ) {}
}
