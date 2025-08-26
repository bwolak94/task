import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from '../orders/events/order-status-changed.event';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { socket: Socket; tenantId: string }>();

  constructor(
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {
    // Listen for order status changes
    this.eventEmitter.on('OrderStatusChangedEvent', (event: OrderStatusChangedEvent) => {
      this.notifyOrderStatusChange(event);
    });
  }

  async handleConnection(client: Socket) {
    try {
      // Extract JWT from handshake auth
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT and extract tenantId
      const payload = this.jwtService.verify(token);
      const tenantId = payload.tenantId;

      if (!tenantId) {
        client.disconnect();
        return;
      }

      // Store client connection
      this.connectedClients.set(client.id, { socket: client, tenantId });

      // Join tenant room
      client.join(`tenant:${tenantId}`);

      console.log(`Client ${client.id} connected for tenant ${tenantId}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { tenantId: string }) {
    const { tenantId } = payload;
    client.join(`tenant:${tenantId}`);
    
    // Update stored tenantId
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.tenantId = tenantId;
    }
  }

  private notifyOrderStatusChange(event: OrderStatusChangedEvent) {
    const { tenantId, orderId, payload } = event;
    
    // Send to all clients in tenant room
    this.server.to(`tenant:${tenantId}`).emit('order.updated', {
      orderId,
      status: payload.status,
    });
  }
}
