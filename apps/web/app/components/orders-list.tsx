'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Order {
  orderId: string;
  status: string;
  createdAt: string;
  buyerEmail: string;
  total: number;
  attachment?: {
    filename: string;
    storageKey: string;
  };
}

interface OrdersResponse {
  items: Order[];
  page: number;
  limit: number;
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filters, setFilters] = useState({
    tenantId: 't-123',
    status: '',
    buyerEmail: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const newSocket = io(WS_URL, {
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InQtMTIzIiwiaWF0IjoxNzU2MjM1OTYzLCJleHAiOjE3NTYyMzk1NjN9.mock-signature',
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('join', { tenantId: 't-123' });
    });

    newSocket.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error);
    });

    newSocket.on('order.updated', (data) => {
      console.log('Order updated:', data);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === data.payload.orderId
            ? { ...order, status: data.payload.status }
            : order
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      console.log('Fetching orders from:', `${API_BASE_URL}/api/orders?${queryParams}`);
      
      const response = await fetch(`${API_BASE_URL}/api/orders?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: OrdersResponse = await response.json();
      console.log('Orders fetched:', data);
      setOrders(data.items);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Orders List</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Tenant ID"
            value={filters.tenantId}
            onChange={(e) => handleFilterChange('tenantId', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <input
            type="email"
            placeholder="Buyer Email"
            value={filters.buyerEmail}
            onChange={(e) => handleFilterChange('buyerEmail', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Page"
            value={filters.page}
            onChange={(e) => handleFilterChange('page', e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Orders
              </>
            )}
          </button>
          
          {refreshing && (
            <span className="text-sm text-gray-500">Updating orders list...</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attachment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.buyerEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.attachment ? (
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        {order.attachment.filename}
                      </span>
                    ) : (
                      <span className="text-gray-400">No attachment</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found. Create your first order above!
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Total orders: {orders.length}
        </div>
      </div>
    </div>
  );
}
