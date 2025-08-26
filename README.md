# Mini-moduł "Zamówienia" - CQRS + Projekcje + Realtime

Implementacja mini-modułu zamówień z architekturą CQRS, projekcjami i powiadomieniami w czasie rzeczywistym.

## Architektura

- **Backend**: NestJS z MongoDB, WebSocket Gateway
- **Frontend**: Next.js 14+ (App Router), Server Actions
- **Baza danych**: MongoDB z indeksami dla filtrów
- **Realtime**: WebSocket przez NestJS Gateway
- **Pliki**: Pre-signed URL (S3/MinIO lub mock)
- **Cache**: Redis (opcjonalnie)

## Struktura projektu

```
/apps
  /api          # NestJS backend (CQRS, projekcje, WS)
  /web          # Next.js frontend (SSR, formularze, WS client)
/infra          # Docker Compose (MongoDB, MinIO, Redis)
```

## Wymagania

- Node.js 18+
- Docker & Docker Compose
- npm lub yarn

## Instalacja i uruchomienie

### 1. Instalacja zależności

```bash
npm install
```

### 2. Uruchomienie infrastruktury

```bash
npm run docker:up
```

To uruchomi:
- MongoDB na porcie 27017
- MinIO na porcie 9000 (S3-compatible)
- Redis na porcie 6379

### 3. Uruchomienie aplikacji

```bash
# Uruchomienie backendu i frontendu
npm run dev

# Lub osobno:
npm run dev:api    # Backend na porcie 3001
npm run dev:web    # Frontend na porcie 3000
```

## API Endpoints

### Tworzenie zamówienia
```bash
curl -X POST http://localhost:3001/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "requestId": "r1",
    "tenantId": "t-123",
    "buyer": {
      "email": "alice@example.com",
      "name": "Alice"
    },
    "items": [
      {
        "sku": "SKU-1",
        "qty": 2,
        "price": 49.99
      }
    ],
    "attachment": {
      "filename": "invoice.pdf",
      "contentType": "application/pdf",
      "size": 123456,
      "storageKey": "tenants/t-123/orders/001/invoice.pdf"
    }
  }'
```

### Lista zamówień z filtrami
```bash
curl 'http://localhost:3001/api/orders?tenantId=t-123&status=PENDING&buyerEmail=alice@example.com&page=1&limit=10'
```

### Pre-signed URL dla uploadu
```bash
curl -X POST http://localhost:3001/api/uploads/presign \
  -H 'Content-Type: application/json' \
  -d '{
    "tenantId": "t-123",
    "filename": "invoice.pdf",
    "contentType": "application/pdf",
    "size": 123456
  }'
```

## Funkcjonalności

### 1. Idempotencja
- Zamówienia są idempotentne po `(tenantId, requestId)`
- Drugi identyczny request zwraca ten sam `orderId` lub 409

### 2. Projekcje
- Read model w osobnej kolekcji `orders_read`
- Indeksy na `(tenantId, status, createdAt)`, `(tenantId, buyer.email)`
- Filtry: status, buyerEmail, zakres dat, paginacja

### 3. Realtime
- WebSocket po autoryzacji JWT
- Event `order.updated` po zmianie statusu
- Symulacja zmiany statusu z PENDING na PAID w 2-5s

### 4. Upload plików
- Pre-signed URL z TTL 120s
- PUT bezpośrednio do S3/MinIO
- Walidacja typu i rozmiaru pliku

## Kompromisy i uproszczenia

### Event Bus
- In-memory publish/subscribe zamiast Kafki
- setTimeout do symulacji zmian statusu
- Interfejs przygotowany na łatwą migrację do prawdziwego brokera

### S3/MinIO
- Mock presign URL jeśli brak Docker
- Lokalny endpoint przyjmujący PUT
- Walidacje i TTL zachowane

### Autoryzacja
- Uproszczony JWT bez rejestracji
- Stały użytkownik i tenantId
- HTTP-only cookie dla WebSocket

## Co bym zrobił w v2

1. **Event Sourcing**: Pełna historia zmian zamówień
2. **Saga Pattern**: Obsługa transakcji rozproszonych
3. **CQRS Read Models**: Więcej projekcji dla różnych widoków
4. **Rate Limiting**: API throttling i quota management
5. **Audit Log**: Pełne logowanie operacji
6. **Testing**: E2E testy z TestContainers
7. **Monitoring**: Metryki, health checks, distributed tracing
8. **Security**: RBAC, API keys, rate limiting per tenant

## Porty

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017
- **MinIO**: http://localhost:9000 (admin/admin123)
- **Redis**: localhost:6379

## Development

```bash
# Nowa funkcjonalność
git flow feature start feature-name

# Zakończenie feature
git flow feature finish feature-name

# Release
git flow release start 1.0.0
git flow release finish 1.0.0
```