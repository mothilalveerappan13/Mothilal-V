export interface ProductItem {
  sku: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minThreshold: number;
  location: string;
  updatedAt: number;
}

export interface OperationLog {
  id: string;
  timestamp: string;
  action: 'INSERT' | 'LOOKUP' | 'DELETE' | 'UPDATE' | 'REORDER';
  sku: string;
  title: string;
  details: string;
  hashInfo?: {
    rawKey: string;
    computedHash: number;
    bucketIndex: number;
    tableSize: number;
    chainDepth: number;
  };
  timeComplexity: string;
}

export interface BucketSnapshotNode {
  sku: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  nextInChain: string | null;
}

export interface BucketSnapshot {
  bucketIndex: number;
  chainLength: number;
  nodes: BucketSnapshotNode[];
}

export interface LinkedListNodeSnapshot {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  prevSku: string | null;
  nextSku: string | null;
}

export interface LinkedListSnapshot {
  headSku: string | null;
  tailSku: string | null;
  count: number;
  nodes: LinkedListNodeSnapshot[];
}

export interface SystemMetrics {
  totalItems: number;
  totalQuantity: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  tableSize: number;
  occupiedBuckets: number;
  maxChainLength: number;
  loadFactor: number;
  totalCollisions: number;
}
