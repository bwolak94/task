'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createOrderSchema = z.object({
  requestId: z.string().min(1, 'Request ID jest wymagane'),
  tenantId: z.string().min(1, 'Tenant ID jest wymagane'),
  buyerEmail: z.string().email('Nieprawidłowy email'),
  buyerName: z.string().min(1, 'Nazwa kupującego jest wymagana'),
  items: z.array(z.object({
    sku: z.string().min(1, 'SKU jest wymagane'),
    qty: z.number().min(1, 'Ilość musi być większa od 0'),
    price: z.number().min(0, 'Cena nie może być ujemna'),
  })).min(1, 'Przynajmniej jeden produkt jest wymagany'),
  attachment: z.object({
    filename: z.string().min(1, 'Nazwa pliku jest wymagana'),
    contentType: z.string().min(1, 'Typ pliku jest wymagany'),
    size: z.number().min(1, 'Rozmiar pliku musi być większy od 0'),
  }).optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export default function CreateOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      tenantId: 't-123',
      items: [{ sku: '', qty: 1, price: 0 }],
    },
  });

  const items = watch('items');

  const addItem = () => {
    const newItems = [...items, { sku: '', qty: 1, price: 0 }];
    // Update form values
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      // Update form values
    }
  };

  const handlePresign = async () => {
    const formData = watch();
    if (!formData.attachment) return;

    try {
      const response = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: formData.tenantId,
          filename: formData.attachment.filename,
          contentType: formData.attachment.contentType,
          size: formData.attachment.size,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUploadUrl(data.url);
        setStorageKey(data.storageKey);
      }
    } catch (error) {
      console.error('Presign error:', error);
    }
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        ...data,
        buyer: {
          email: data.buyerEmail,
          name: data.buyerName,
        },
        attachment: data.attachment && storageKey ? {
          ...data.attachment,
          storageKey,
        } : undefined,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Zamówienie utworzone! ID: ${result.orderId}`);
        reset();
        setUploadUrl(null);
        setStorageKey(null);
      } else {
        alert('Błąd podczas tworzenia zamówienia');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Błąd podczas tworzenia zamówienia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Request ID
          </label>
          <input
            type="text"
            {...register('requestId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="r1"
          />
          {errors.requestId && (
            <p className="mt-1 text-sm text-red-600">{errors.requestId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tenant ID
          </label>
          <input
            type="text"
            {...register('tenantId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="t-123"
          />
          {errors.tenantId && (
            <p className="mt-1 text-sm text-red-600">{errors.tenantId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email kupującego
          </label>
          <input
            type="email"
            {...register('buyerEmail')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="alice@example.com"
          />
          {errors.buyerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.buyerEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nazwa kupującego
          </label>
          <input
            type="text"
            {...register('buyerName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Alice"
          />
          {errors.buyerName && (
            <p className="mt-1 text-sm text-red-600">{errors.buyerName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Produkty
        </label>
        <div className="space-y-3">
          {items.map((_, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                {...register(`items.${index}.sku`)}
                placeholder="SKU"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                {...register(`items.${index}.qty`, { valueAsNumber: true })}
                placeholder="Ilość"
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.01"
                {...register(`items.${index}.price`, { valueAsNumber: true })}
                placeholder="Cena"
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Usuń
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Dodaj produkt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nazwa pliku
          </label>
          <input
            type="text"
            {...register('attachment.filename')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="invoice.pdf"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Typ pliku
          </label>
          <input
            type="text"
            {...register('attachment.contentType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="application/pdf"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rozmiar (bytes)
          </label>
          <input
            type="number"
            {...register('attachment.size', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="123456"
          />
        </div>
      </div>

      {uploadUrl && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">
            Upload URL: {uploadUrl}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handlePresign}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Generuj presign URL
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Tworzenie...' : 'Utwórz zamówienie'}
        </button>
      </div>
    </form>
  );
}
