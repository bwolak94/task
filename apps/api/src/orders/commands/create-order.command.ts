import { ICommand } from '@nestjs/cqrs';

export class CreateOrderCommand implements ICommand {
  constructor(
    public readonly requestId: string,
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
    public readonly attachment?: {
      filename: string;
      contentType: string;
      size: number;
      storageKey: string;
    },
  ) {}
}
