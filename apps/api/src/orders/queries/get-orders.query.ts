import { IQuery } from '@nestjs/cqrs';

export class GetOrdersQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly status?: 'PENDING' | 'PAID' | 'CANCELLED',
    public readonly buyerEmail?: string,
    public readonly from?: string,
    public readonly to?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
