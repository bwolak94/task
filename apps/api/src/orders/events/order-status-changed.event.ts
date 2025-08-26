import { IEvent } from '@nestjs/cqrs';

export class OrderStatusChangedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly payload: {
      status: 'PENDING' | 'PAID' | 'CANCELLED';
      previousStatus: 'PENDING' | 'PAID' | 'CANCELLED';
    },
  ) {}
}
