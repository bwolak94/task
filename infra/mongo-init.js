// MongoDB initialization script
// Creates database, collections and indexes for orders module

db = db.getSiblingDB('orders');

// Create collections
db.createCollection('orders');
db.createCollection('orders_read');
db.createCollection('events_outbox');

// Create indexes for write model (idempotency)
db.orders.createIndex(
  { "tenantId": 1, "requestId": 1 },
  { unique: true, name: "idx_tenant_request_unique" }
);

// Create indexes for read model (filtering and pagination)
db.orders_read.createIndex(
  { "tenantId": 1, "status": 1, "createdAt": -1 },
  { name: "idx_tenant_status_created" }
);

db.orders_read.createIndex(
  { "tenantId": 1, "buyerEmail": 1 },
  { name: "idx_tenant_buyer_email" }
);

db.orders_read.createIndex(
  { "tenantId": 1, "createdAt": -1 },
  { name: "idx_tenant_created_desc" }
);

// Create index for events outbox
db.events_outbox.createIndex(
  { "processed": 1, "createdAt": 1 },
  { name: "idx_outbox_processed_created" }
);

print('MongoDB initialized with orders module collections and indexes');
