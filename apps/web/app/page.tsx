import OrdersList from './components/orders-list';
import CreateOrderForm from './components/create-order-form';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Utwórz nowe zamówienie
        </h2>
        <CreateOrderForm />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Lista zamówień
        </h2>
        <OrdersList />
      </div>
    </div>
  );
}
