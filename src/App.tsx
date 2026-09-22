import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Boxes,
  Hash,
  GitCommit,
  Layers,
  Sparkles,
  Terminal,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  ProductItem,
  OperationLog,
  BucketSnapshot,
  LinkedListSnapshot,
  SystemMetrics,
} from './types';
import { InventoryEngine } from './data-structures/InventoryEngine';
import { INITIAL_PRODUCTS } from './data/seedData';
import { Header } from './components/Header';
import { InventoryTable } from './components/InventoryTable';
import { HashTableVisualizer } from './components/HashTableVisualizer';
import { LinkedListVisualizer } from './components/LinkedListVisualizer';
import { HashCalculator } from './components/HashCalculator';
import { OperationLogs } from './components/OperationLogs';
import { ProductModal } from './components/ProductModal';
import { NodeDetailModal } from './components/NodeDetailModal';
import { CCodeViewer } from './components/CCodeViewer';

export default function App() {
  // Engine instance reference
  const engineRef = useRef<InventoryEngine>(new InventoryEngine(13));

  // Reactive state synced with data structure
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [buckets, setBuckets] = useState<BucketSnapshot[]>([]);
  const [linkedList, setLinkedList] = useState<LinkedListSnapshot>({
    headSku: null,
    tailSku: null,
    count: 0,
    nodes: [],
  });
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalItems: 0,
    totalQuantity: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    tableSize: 13,
    occupiedBuckets: 0,
    maxChainLength: 0,
    loadFactor: 0,
    totalCollisions: 0,
  });

  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [activeView, setActiveView] = useState<'inventory' | 'datastructure' | 'logs' | 'ccode'>('inventory');
  const [highlightedSku, setHighlightedSku] = useState<string | null>(null);
  const [inspectedSku, setInspectedSku] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [recentNotice, setRecentNotice] = useState<{
    type: 'success' | 'info' | 'warning';
    title: string;
    details: string;
    complexity: string;
  } | null>(null);

  // Synchronize React state with InventoryEngine
  const syncWithEngine = useCallback(() => {
    if (!engineRef.current) return;
    setProducts(engineRef.current.toArray());
    setBuckets(engineRef.current.getBucketSnapshots());
    setLinkedList(engineRef.current.getLinkedListSnapshot());
    setMetrics(engineRef.current.getMetrics());
  }, []);

  // Initialize engine with seed data on mount
  useEffect(() => {
    INITIAL_PRODUCTS.forEach((prod) => {
      engineRef.current.insert(prod);
    });
    syncWithEngine();

    // Initial system log
    const initialLog: OperationLog = {
      id: `init-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'INSERT',
      sku: 'SYSTEM',
      title: 'Initialized Inventory Engine',
      details: `Bootstrapped ${INITIAL_PRODUCTS.length} products into Hash Table (M=13) and Doubly Linked List.`,
      timeComplexity: 'O(N) bootstrap',
    };
    setLogs([initialLog]);
  }, [syncWithEngine]);

  // Hashing helper
  const computeHash = useCallback((sku: string) => {
    return engineRef.current.computeHash(sku);
  }, []);

  // Operation Handlers
  const handleInsert = (item: ProductItem) => {
    const { log, isUpdate } = engineRef.current.insert(item);
    syncWithEngine();
    setLogs((prev) => [log, ...prev]);
    setHighlightedSku(item.sku);
    setRecentNotice({
      type: 'success',
      title: log.title,
      details: log.details,
      complexity: log.timeComplexity,
    });
  };

  const handleSearch = (sku: string) => {
    const { item, log } = engineRef.current.search(sku);
    setLogs((prev) => [log, ...prev]);
    setHighlightedSku(sku);

    if (item) {
      setRecentNotice({
        type: 'success',
        title: `Found [${sku}] in O(1) average time`,
        details: log.details,
        complexity: log.timeComplexity,
      });
      setInspectedSku(sku);
    } else {
      setRecentNotice({
        type: 'warning',
        title: `Product [${sku}] not found`,
        details: log.details,
        complexity: log.timeComplexity,
      });
    }
  };

  const handleUpdateQuantity = (sku: string, delta: number) => {
    const { success, log } = engineRef.current.updateQuantity(sku, delta);
    if (success) {
      syncWithEngine();
      setLogs((prev) => [log, ...prev]);
      setHighlightedSku(sku);
      setRecentNotice({
        type: 'info',
        title: log.title,
        details: log.details,
        complexity: log.timeComplexity,
      });
    }
  };

  const handleDelete = (sku: string) => {
    const { success, log } = engineRef.current.delete(sku);
    if (success) {
      syncWithEngine();
      setLogs((prev) => [log, ...prev]);
      if (highlightedSku === sku) setHighlightedSku(null);
      if (inspectedSku === sku) setInspectedSku(null);
      setRecentNotice({
        type: 'warning',
        title: log.title,
        details: log.details,
        complexity: log.timeComplexity,
      });
    }
  };

  const handleMoveToHead = (sku: string) => {
    const { success, log } = engineRef.current.moveToFront(sku);
    if (success) {
      syncWithEngine();
      setLogs((prev) => [log, ...prev]);
      setHighlightedSku(sku);
      setRecentNotice({
        type: 'info',
        title: log.title,
        details: log.details,
        complexity: log.timeComplexity,
      });
    }
  };

  const handleResetData = () => {
    const newEngine = new InventoryEngine(13);
    INITIAL_PRODUCTS.forEach((p) => newEngine.insert(p));
    engineRef.current = newEngine;
    syncWithEngine();
    setHighlightedSku(null);
    setInspectedSku(null);

    const resetLog: OperationLog = {
      id: `reset-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'INSERT',
      sku: 'SYSTEM',
      title: 'Reset Inventory to Initial Dataset',
      details: `Re-populated standard retail dataset across 13 hash buckets and doubly linked list.`,
      timeComplexity: 'O(N)',
    };
    setLogs((prev) => [resetLog, ...prev]);
    setRecentNotice({
      type: 'info',
      title: 'Dataset Reset Complete',
      details: 'All 10 sample products restored to original stock counts and pointer links.',
      complexity: 'O(N)',
    });
  };

  const handleTriggerCollisionDemo = () => {
    // Find an occupied bucket to guarantee collision
    const occupiedBucket = buckets.find((b) => b.chainLength > 0);
    const targetBucketIndex = occupiedBucket ? occupiedBucket.bucketIndex : 4;

    // Generate a SKU that hits targetBucketIndex
    let collidingSku = '';
    for (let i = 1; i <= 500; i++) {
      const candidate = `COLLIDE-${i}`;
      if (engineRef.current.computeHash(candidate).bucketIndex === targetBucketIndex) {
        // Ensure SKU is not already used
        if (!products.some((p) => p.sku === candidate)) {
          collidingSku = candidate;
          break;
        }
      }
    }

    if (!collidingSku) {
      collidingSku = `COLLIDE-${Date.now() % 1000}`;
    }

    const collisionItem: ProductItem = {
      sku: collidingSku,
      name: `Special Batch Item (Collides with Bucket #${targetBucketIndex})`,
      category: 'Components',
      price: 2999.0,
      quantity: 15,
      minThreshold: 5,
      location: `Zone C, Bin #${targetBucketIndex + 1}`,
      updatedAt: Date.now(),
    };

    const { log } = engineRef.current.insert(collisionItem);
    syncWithEngine();
    setLogs((prev) => [log, ...prev]);
    setHighlightedSku(collidingSku);
    setActiveView('datastructure');
    setRecentNotice({
      type: 'warning',
      title: `Collision Demo: Chained to Bucket #${targetBucketIndex}`,
      details: `Computed hash for ${collidingSku} mapped directly to occupied Bucket #${targetBucketIndex}. The item was prepended to the bucket's linked list chain in O(1)!`,
      complexity: 'O(1) Separate Chaining',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Navbar */}
      <Header
        metrics={metrics}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
        onTriggerCollisionDemo={handleTriggerCollisionDemo}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Operation Notice Toast */}
        {recentNotice && (
          <div
            id="recent-operation-banner"
            className={`border rounded-lg p-3 flex items-start justify-between gap-3 shadow-2xs transition-all ${
              recentNotice.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : recentNotice.type === 'warning'
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-blue-50/90 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                {recentNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : recentNotice.type === 'warning' ? (
                  <Sparkles className="w-4 h-4 text-amber-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{recentNotice.title}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/70 border border-current font-semibold">
                    {recentNotice.complexity}
                  </span>
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {recentNotice.details}
                </p>
              </div>
            </div>

            <button
              onClick={() => setRecentNotice(null)}
              className="text-current opacity-60 hover:opacity-100 p-1 text-xs cursor-pointer"
              aria-label="Dismiss banner"
            >
              &times;
            </button>
          </div>
        )}

        {/* View 1: Inventory Catalog */}
        {activeView === 'inventory' && (
          <div className="space-y-6">
            <InventoryTable
              products={products}
              onSearch={handleSearch}
              onUpdateQuantity={handleUpdateQuantity}
              onDeleteProduct={handleDelete}
              onMoveToHead={handleMoveToHead}
              onInspectItem={(sku) => {
                setHighlightedSku(sku);
                setInspectedSku(sku);
              }}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              computeHash={computeHash}
            />

            {/* Quick Hash Sandbox inside Catalog */}
            <div className="pt-2">
              <HashCalculator
                tableSize={metrics.tableSize}
                buckets={buckets}
                onQuickSearch={handleSearch}
              />
            </div>
          </div>
        )}

        {/* View 2: Data Structure Visualizer */}
        {activeView === 'datastructure' && (
          <div className="space-y-6">
            {/* Hash Table Visualizer Section */}
            <HashTableVisualizer
              buckets={buckets}
              metrics={metrics}
              highlightedSku={highlightedSku}
              onSelectSku={(sku) => {
                setHighlightedSku(sku);
                setInspectedSku(sku);
              }}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            {/* Doubly Linked List Visualizer Section */}
            <LinkedListVisualizer
              linkedList={linkedList}
              highlightedSku={highlightedSku}
              onSelectSku={(sku) => {
                setHighlightedSku(sku);
                setInspectedSku(sku);
              }}
              onMoveToHead={handleMoveToHead}
            />

            {/* Interactive Hash Calculator */}
            <HashCalculator
              tableSize={metrics.tableSize}
              buckets={buckets}
              onQuickSearch={handleSearch}
            />
          </div>
        )}

        {/* View 3: Algorithm Tracer & Logs */}
        {activeView === 'logs' && (
          <div className="space-y-6">
            <OperationLogs
              logs={logs}
              onClearLogs={() => setLogs([])}
            />

            {/* Architecture Explainer Card */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 mb-2">
                Why Combine Hash Table and Doubly Linked List?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600 leading-relaxed">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                  <div className="font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-zinc-700" />
                    Hash Table Strength: O(1) SKU Lookups
                  </div>
                  <p>
                    A standard array or linked list requires O(N) scanning to locate an item by SKU.
                    The Hash Table maps each SKU directly to a bucket in O(1) time. In this architecture,
                    each hash table bucket entry contains a direct memory reference to its node inside
                    the Doubly Linked List.
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                  <div className="font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-zinc-700" />
                    Doubly Linked List Strength: O(1) Deletions & Ordering
                  </div>
                  <p>
                    A standard Hash Table has no deterministic order and scanning all items requires
                    iterating empty buckets (O(M + N)). By linking all items in a Doubly Linked List,
                    we can iterate in strict O(N) time, maintain inventory chronology or priority, and
                    splice/delete nodes in O(1) without shifting array elements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 4: C Code Implementation */}
        {activeView === 'ccode' && (
          <div className="space-y-6">
            <CCodeViewer />
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleInsert}
        computeHash={computeHash}
        tableSize={metrics.tableSize}
      />

      {/* Node Detail / Inspection Modal */}
      <NodeDetailModal
        sku={inspectedSku}
        onClose={() => setInspectedSku(null)}
        products={products}
        buckets={buckets}
        linkedList={linkedList}
        onUpdateQuantity={handleUpdateQuantity}
        onDeleteProduct={handleDelete}
        onMoveToHead={handleMoveToHead}
        computeHash={computeHash}
      />
    </div>
  );
}
