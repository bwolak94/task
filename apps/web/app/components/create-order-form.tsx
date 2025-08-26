'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const createOrderSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  buyer: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Buyer name is required'),
  }),
  items: z.array(z.object({
    sku: z.string().min(1, 'SKU is required'),
    qty: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
  })).min(1, 'At least one item is required'),
  attachment: z.object({
    filename: z.string().min(1, 'Filename is required'),
    contentType: z.string().min(1, 'Content type is required'),
    size: z.number().min(1, 'File size must be greater than 0'),
  }),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderFormProps {
  onOrderCreated?: () => void;
}

export default function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      requestId: `req_${Date.now()}`,
      tenantId: 't-123',
      buyer: {
        email: 'alice@example.com',
        name: 'Alice',
      },
      items: [
        {
          sku: 'SKU-1',
          qty: 2,
          price: 49.99,
        },
      ],
      attachment: {
        filename: 'invoice.pdf',
        contentType: 'application/pdf',
        size: 123456,
      },
    },
  });

  const watchedItems = watch('items');

  const addItem = () => {
    const newItems = [...watchedItems, { sku: '', qty: 1, price: 0 }];
  };

  const removeItem = (index: number) => {
    if (watchedItems.length > 1) {
      const newItems = watchedItems.filter((_, i) => i !== index);
    }
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: `Order created successfully! Order ID: ${result.orderId}`,
        });
        
        reset({
          ...data,
          requestId: `req_${Date.now()}`,
        });
        
        if (onOrderCreated) {
          onOrderCreated();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({
          type: 'error',
          text: errorData.message || `Failed to create order. Status: ${response.status}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return watchedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Order</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request ID
            </label>
            <input
              {...register('requestId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.requestId && (
              <p className="mt-1 text-sm text-red-600">{errors.requestId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant ID
            </label>
            <input
              {...register('tenantId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.tenantId && (
              <p className="mt-1 text-sm text-red-600">{errors.tenantId.message}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Buyer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('buyer.email')}
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.buyer?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.buyer.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                {...register('buyer.name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.buyer?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.buyer.name.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Item
            </button>
          </div>

          {watchedItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  {...register(`items.${index}.sku`)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.items?.[index]?.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.items[index]?.sku?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  {...register(`items.${index}.qty`, { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.items?.[index]?.qty && (
                  <p className="mt-1 text-sm text-red-600">{errors.items[index]?.qty?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  {...register(`items.${index}.price`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.items?.[index]?.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.items[index]?.price?.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={watchedItems.length === 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {errors.items && (
            <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attachment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filename
              </label>
              <input
                {...register('attachment.filename')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.attachment?.filename && (
                <p className="mt-1 text-sm text-red-600">{errors.attachment.filename.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <input
                {...register('attachment.contentType')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.attachment?.contentType && (
                <p className="mt-1 text-sm text-red-600">{errors.attachment.contentType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (bytes)
              </label>
              <input
                {...register('attachment.size', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.attachment?.size && (
                <p className="mt-1 text-sm text-red-600">{errors.attachment.size.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium text-gray-900">
              Total: <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
