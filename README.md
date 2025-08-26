# Orders Module - CQRS + Projections + Realtime

Mini-moduł "Zamówienia" z architekturą CQRS + projekcje + realtime.

## Architektura

- **Backend**: NestJS (Node 18+) z CQRS
- **Frontend**: Next.js 14+ (App Router, SSR/Server Actions)
- **Baza danych**: MongoDB z Mongoose
- **Realtime**: WebSocket (Nest Gateway)
- **Pliki**: S3/MinIO pre-signed URLs
- **Cache**: Redis (opcjonalnie)

## Struktura projektu

```
/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── infra/            # Docker infrastructure
└── README.md
```

## Wymagania

- Node.js 18+
- Docker & Docker Compose
- MongoDB
- MinIO (S3-compatible)

## Instalacja

### 1. Klonowanie i instalacja zależności

```bash
git clone <repo-url>
cd task
npm install
```

### 2. Konfiguracja środowiska

Skopiuj plik `.env.example` do `.env` i dostosuj wartości:

```bash
cp .env.example .env
```

Główne zmienne środowiskowe:

```bash
# API Configuration
API_PORT=3001
WEB_PORT=3002

# Database
MONGODB_URI=mongodb://admin:admin123@localhost:27017/orders?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Uruchomienie infrastruktury

```bash
npm run docker:up
```

### 4. Uruchomienie aplikacji

```bash
# Development (oba serwisy)
npm run dev

# Lub osobno:
npm run dev:api    # Backend na porcie 3001
npm run dev:web    # Frontend na porcie 3002
```

## Komendy

```bash
# Development
npm run dev              # Uruchamia oba serwisy
npm run dev:api          # Tylko backend
npm run dev:web          # Tylko frontend

# Build
npm run build            # Build obu aplikacji
npm run build:api        # Build backendu
npm run build:web        # Build frontendu

# Production
npm run start            # Uruchamia oba serwisy w trybie produkcyjnym
npm run start:api        # Backend w trybie produkcyjnym
npm run start:web        # Frontend w trybie produkcyjnym

# Docker
npm run docker:up        # Uruchamia infrastrukturę
npm run docker:down      # Zatrzymuje infrastrukturę

# Testy i linting
npm run test             # Uruchamia testy
npm run lint             # Uruchamia linting
```

## Porty

- **API Backend**: 3001
- **Web Frontend**: 3002
- **MongoDB**: 27017
- **MinIO**: 9000 (API), 9001 (Console)
- **Redis**: 6380

## API Endpoints

### 1. Create Order (Command)

```bash
POST /api/orders
Content-Type: application/json

{
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
    "size": 123456
  }
}
```

**Wymagania:**
- Idempotencja po (tenantId, requestId)
- Walidacja pól
- Limit rozmiaru pliku (10MB)
- Zapisz write model + wyemituj OrderCreated event

**Response (201):**
```json
{
  "orderId": "ord_abc123"
}
```

### 2. List Orders (Query / projekcja)

```bash
GET /api/orders?status=PENDING&buyerEmail=alice@example.com&page=1&limit=10
```

**Response (200):**
```json
{
  "items": [
    {
      "orderId": "ord_abc123",
      "status": "PENDING",
      "createdAt": "2025-08-22T09:00:00Z",
      "buyerEmail": "alice@example.com",
      "total": 99.98,
      "attachment": {
        "filename": "invoice.pdf",
        "storageKey": "tenants/t-123/orders/001/invoice.pdf"
      }
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

### 3. Presign Upload

```bash
POST /api/uploads/presign
Content-Type: application/json

{
  "tenantId": "t-123",
  "filename": "invoice.pdf",
  "contentType": "application/pdf",
  "size": 123456
}
```

**Response:**
```json
{
  "url": "https://minio.local/...signed...",
  "storageKey": "tenants/t-123/orders/001/invoice.pdf",
  "expiresInSeconds": 120,
  "headers": {
    "Content-Type": "application/pdf"
  }
}
```

## Funkcjonalności

### Idempotencja
- Unikalny indeks na (tenantId, requestId)
- Drugi call z tym samym requestId zwraca ten sam orderId
- Brak duplikatów

### Projekcje
- Osobna kolekcja `orders_read` dla listy
- Denormalizacja pod szybkie zapytania
- Aktualizacja przez event handlers

### Realtime
- WebSocket połączenie z autoryzacją JWT
- Event `order.updated` po zmianie statusu
- Automatyczna aktualizacja UI bez reloadu

### Upload
- Pre-signed URL z S3/MinIO
- Walidacja typu i rozmiaru pliku
- Bezpośredni upload do storage (bez proxy)

## Indeksy MongoDB

```javascript
// Write model (idempotencja)
db.orders.createIndex({ "tenantId": 1, "requestId": 1 }, { unique: true })

// Read model (filtry)
db.orders_read.createIndex({ "tenantId": 1, "status": 1, "createdCQRS + Projekcje + Realtime
### Event Bus
- In-memory event bus zamiast Kafki
- setTimeout(2-5s) do symulacji status change
- Łatwe zastąpienie prawdziwym brokerem

### S3/MinIO
- Mock presign URL (lokalny endpoint)
- Brak prawdziwego uploadu plików
- Zachowanie flow i walidacji

### Auth
- Uproszczony JWT
- Stały użytkownik i tenantId
- Brak rejestracji/logowania

## v2 - Co bym zrobił następnym razem

1. **Event Bus**: Kafka/RabbitMQ zamiast in-memory
2. **S3**: Prawdziwe pre-signed URLs z MinIO
3. **Auth**: Pełna autentykacja z Supabase Auth
4. **Cache**: Redis cache dla listy zamówień
5. **Monitoring**: Prometheus + Grafana
6. **Logging**: Structured logging z Winston
7. **Testing**: E2E testy z Playwright
8. **CI/CD**: GitHub Actions z deployment
9. **Documentation**: OpenAPI/Swagger
10. **Error Handling**: Global error handling z custom error types

## Testowanie

### Akceptacja (curl)

1. **Idempotencja**
```bash
# Pierwszy call
curl -s -XPOST http://localhost:3001/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"requestId":"r1","tenantId":"t-123","buyer":{"email":"alice@example.com","name":"Alice"},"items":[{"sku":"SKU-1","qty":2,"price":49.99}],"attachment":{"filename":"invoice.pdf","contentType":"application/pdf","size":123456}}'

# Drugi call z tym samym requestId - powinien zwrócić ten sam orderId
curl -s -XPOST http://localhost:3001/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"requestId":"r1","tenantId":"t-123","buyer":{"email":"alice@example.com","name":"Alice"},"items":[{"sku":"SKU-1","qty":2,"price":49.99}],"attachment":{"filename":"invoice.pdf","contentType":"application/pdf","size":123456}}'
```

2. **Lista + filtry**
```bash
curl -s 'http://localhost:3001/api/orders?tenantId=t-123&status=PENDING&buyerEmail=alice@example.com&page=1&limit=10'
```

3. **Presign**
```bash
curl -s -XPOST http://localhost:3001/api/uploads/presign \
  -H 'Content-Type: application/json' \
  -d '{"tenantId":"t-123","filename":"test.pdf","contentType":"application/pdf","size":123456}'
```

## Git Flow

```bash
# Inicjalizacja
git flow init

# Feature branch
git flow feature start feature-name
git flow feature finish feature-name

# Release
git flow release start 1.0.0
git flow release finish 1.0.0

# Hotfix
git flow hotfix start hotfix-name
git flow hotfix finish hotfix-name
```

## Rozwój

1. **Feature branch**: `git flow feature start feature-name`
2. **Development**: Implementacja funkcjonalności
3. **Testing**: Testy lokalne
4. **Finish feature**: `git flow feature finish feature-name`
5. **Release**: `git flow release start 1.0.0`
6. **Production**: `git flow release finish 1.0.0`

## Troubleshooting

### Port conflicts
```bash
# Sprawdź zajęte porty
lsof -i :3001
lsof -i :3002

# Zatrzymaj procesy
pkill -f "nest start"
pkill -f "npm run dev"
```

### Docker issues
```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Sprawdź logi
docker-compose logs mongodb
docker-compose logs minio
```

### API not starting
```bash
# Sprawdź logi
cd apps/api && npm run start:dev

# Sprawdź połączenie z MongoDB
curl http://localhost:27017
```