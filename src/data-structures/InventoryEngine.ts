import {
  ProductItem,
  OperationLog,
  BucketSnapshot,
  LinkedListSnapshot,
  SystemMetrics,
} from '../types';

export class DoublyLinkedListNode {
  key: string;
  item: ProductItem;
  prev: DoublyLinkedListNode | null = null;
  next: DoublyLinkedListNode | null = null;

  constructor(key: string, item: ProductItem) {
    this.key = key;
    this.item = item;
  }
}

export class HashBucketNode {
  key: string;
  listNode: DoublyLinkedListNode;
  next: HashBucketNode | null = null;

  constructor(key: string, listNode: DoublyLinkedListNode) {
    this.key = key;
    this.listNode = listNode;
  }
}

export class InventoryEngine {
  private tableSize: number;
  private buckets: (HashBucketNode | null)[];
  private head: DoublyLinkedListNode | null = null;
  private tail: DoublyLinkedListNode | null = null;
  private itemCount: number = 0;

  constructor(initialTableSize: number = 13) {
    this.tableSize = initialTableSize;
    this.buckets = new Array(this.tableSize).fill(null);
  }

  // DJB2 Hash function for even bucket distribution
  public computeHash(key: string): { rawHash: number; bucketIndex: number } {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) + hash + key.charCodeAt(i);
      hash = hash & 0x7fffffff; // keep positive 31-bit integer
    }
    const bucketIndex = hash % this.tableSize;
    return { rawHash: hash, bucketIndex };
  }

  /**
   * INSERT operation:
   * 1. Check if SKU exists via hash bucket lookup.
   * 2. If exists, update existing item in O(1).
   * 3. If new, create Doubly Linked List node, append to tail in O(1).
   * 4. Insert HashBucketNode into hash table bucket chain in O(1).
   */
  public insert(item: ProductItem): { log: OperationLog; isUpdate: boolean } {
    const { rawHash, bucketIndex } = this.computeHash(item.sku);
    let current = this.buckets[bucketIndex];
    let chainDepth = 0;

    // Check if key already exists in the bucket chain
    while (current !== null) {
      chainDepth++;
      if (current.key === item.sku) {
        // Update existing item
        current.listNode.item = { ...item, updatedAt: Date.now() };
        const log: OperationLog = {
          id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'UPDATE',
          sku: item.sku,
          title: `Updated Product [${item.sku}]`,
          details: `Found existing SKU in Bucket #${bucketIndex} at depth ${chainDepth}. Updated product fields in-place in O(1) average time.`,
          hashInfo: {
            rawKey: item.sku,
            computedHash: rawHash,
            bucketIndex,
            tableSize: this.tableSize,
            chainDepth,
          },
          timeComplexity: 'O(1) avg',
        };
        return { log, isUpdate: true };
      }
      current = current.next;
    }

    // New item insertion
    const newListNode = new DoublyLinkedListNode(item.sku, {
      ...item,
      updatedAt: Date.now(),
    });

    // 1. Insert into Doubly Linked List (Append to Tail)
    if (!this.head) {
      this.head = newListNode;
      this.tail = newListNode;
    } else {
      newListNode.prev = this.tail;
      if (this.tail) {
        this.tail.next = newListNode;
      }
      this.tail = newListNode;
    }

    // 2. Insert into Hash Table Bucket (Prepend to Bucket Chain)
    const newBucketNode = new HashBucketNode(item.sku, newListNode);
    newBucketNode.next = this.buckets[bucketIndex];
    this.buckets[bucketIndex] = newBucketNode;

    this.itemCount++;

    const log: OperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'INSERT',
      sku: item.sku,
      title: `Inserted [${item.sku}] "${item.name}"`,
      details: `Hashed SKU -> raw hash ${rawHash} -> mapped to Bucket [${bucketIndex}]. Appended to Linked List tail and linked in Hash Table bucket in O(1).`,
      hashInfo: {
        rawKey: item.sku,
        computedHash: rawHash,
        bucketIndex,
        tableSize: this.tableSize,
        chainDepth: 1,
      },
      timeComplexity: 'O(1) constant',
    };

    return { log, isUpdate: false };
  }

  /**
   * LOOKUP / SEARCH by SKU:
   * Calculates hash -> Bucket[index] -> traverses small chain in O(1) avg
   */
  public search(sku: string): {
    item: ProductItem | null;
    log: OperationLog;
  } {
    const { rawHash, bucketIndex } = this.computeHash(sku);
    let current = this.buckets[bucketIndex];
    let chainDepth = 0;

    while (current !== null) {
      chainDepth++;
      if (current.key === sku) {
        const item = current.listNode.item;
        const log: OperationLog = {
          id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'LOOKUP',
          sku,
          title: `Lookup Hit: [${sku}]`,
          details: `Direct Hash Index hit on Bucket #${bucketIndex} (depth ${chainDepth}). Retrieved node pointer in O(1) average time without scanning full inventory.`,
          hashInfo: {
            rawKey: sku,
            computedHash: rawHash,
            bucketIndex,
            tableSize: this.tableSize,
            chainDepth,
          },
          timeComplexity: 'O(1) avg lookup',
        };
        return { item, log };
      }
      current = current.next;
    }

    const log: OperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'LOOKUP',
      sku,
      title: `Lookup Miss: [${sku}]`,
      details: `Hashed SKU -> Bucket #${bucketIndex}. Examined ${chainDepth} node(s) in chain; item does not exist in inventory.`,
      hashInfo: {
        rawKey: sku,
        computedHash: rawHash,
        bucketIndex,
        tableSize: this.tableSize,
        chainDepth,
      },
      timeComplexity: 'O(1) avg check',
    };

    return { item: null, log };
  }

  /**
   * DELETE operation:
   * 1. Find node in hash bucket chain.
   * 2. Unlink from Doubly Linked List in O(1) via node.prev and node.next.
   * 3. Unlink from Hash Table Bucket chain in O(1).
   */
  public delete(sku: string): { success: boolean; log: OperationLog } {
    const { rawHash, bucketIndex } = this.computeHash(sku);
    let current = this.buckets[bucketIndex];
    let prevBucketNode: HashBucketNode | null = null;
    let chainDepth = 0;

    while (current !== null) {
      chainDepth++;
      if (current.key === sku) {
        const listNode = current.listNode;
        const deletedName = listNode.item.name;

        // 1. Unlink from Doubly Linked List in O(1)
        if (listNode.prev) {
          listNode.prev.next = listNode.next;
        } else {
          this.head = listNode.next;
        }

        if (listNode.next) {
          listNode.next.prev = listNode.prev;
        } else {
          this.tail = listNode.prev;
        }

        // 2. Unlink from Hash Table Bucket chain in O(1)
        if (prevBucketNode) {
          prevBucketNode.next = current.next;
        } else {
          this.buckets[bucketIndex] = current.next;
        }

        this.itemCount--;

        const log: OperationLog = {
          id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'DELETE',
          sku,
          title: `Deleted [${sku}] "${deletedName}"`,
          details: `Removed from Bucket #${bucketIndex} chain and unlinked doubly linked pointers (prev/next) in O(1) time.`,
          hashInfo: {
            rawKey: sku,
            computedHash: rawHash,
            bucketIndex,
            tableSize: this.tableSize,
            chainDepth,
          },
          timeComplexity: 'O(1) time',
        };

        return { success: true, log };
      }
      prevBucketNode = current;
      current = current.next;
    }

    const log: OperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'DELETE',
      sku,
      title: `Deletion Failed: [${sku}]`,
      details: `Cannot delete: SKU not found in Bucket #${bucketIndex}.`,
      hashInfo: {
        rawKey: sku,
        computedHash: rawHash,
        bucketIndex,
        tableSize: this.tableSize,
        chainDepth,
      },
      timeComplexity: 'O(1) avg check',
    };

    return { success: false, log };
  }

  /**
   * Update Quantity (Restock or Sale)
   */
  public updateQuantity(
    sku: string,
    delta: number
  ): { success: boolean; newQuantity: number; log: OperationLog } {
    const { item, log: searchLog } = this.search(sku);
    if (!item) {
      return {
        success: false,
        newQuantity: 0,
        log: {
          ...searchLog,
          title: `Stock Adjustment Failed: [${sku}] not found`,
        },
      };
    }

    const oldQty = item.quantity;
    const newQty = Math.max(0, oldQty + delta);
    item.quantity = newQty;
    item.updatedAt = Date.now();

    const log: OperationLog = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'UPDATE',
      sku,
      title: `Stock Adjusted for [${sku}] (${delta >= 0 ? `+${delta}` : delta})`,
      details: `Quantity changed from ${oldQty} to ${newQty}. Direct memory pointer updated through hash table reference in O(1).`,
      hashInfo: searchLog.hashInfo,
      timeComplexity: 'O(1) pointer update',
    };

    return { success: true, newQuantity: newQty, log };
  }

  /**
   * Move item to front of Linked List (e.g. Priority or Recently Accessed)
   */
  public moveToFront(sku: string): { success: boolean; log: OperationLog } {
    const { rawHash, bucketIndex } = this.computeHash(sku);
    let current = this.buckets[bucketIndex];

    while (current !== null) {
      if (current.key === sku) {
        const node = current.listNode;
        if (node === this.head) {
          // Already at head
          return {
            success: true,
            log: {
              id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: new Date().toLocaleTimeString(),
              action: 'REORDER',
              sku,
              title: `[${sku}] Already at Linked List Head`,
              details: `Node is already at position 0 in the sequential doubly linked list.`,
              timeComplexity: 'O(1)',
            },
          };
        }

        // Unlink node
        if (node.prev) {
          node.prev.next = node.next;
        }
        if (node.next) {
          node.next.prev = node.prev;
        } else {
          this.tail = node.prev;
        }

        // Place at head
        node.prev = null;
        node.next = this.head;
        if (this.head) {
          this.head.prev = node;
        }
        this.head = node;

        const log: OperationLog = {
          id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'REORDER',
          sku,
          title: `Moved [${sku}] to Linked List Head (O(1))`,
          details: `Re-linked pointers in doubly linked list in O(1) time using node reference fetched via hash table lookup.`,
          hashInfo: {
            rawKey: sku,
            computedHash: rawHash,
            bucketIndex,
            tableSize: this.tableSize,
            chainDepth: 1,
          },
          timeComplexity: 'O(1) pointer relink',
        };

        return { success: true, log };
      }
      current = current.next;
    }

    return {
      success: false,
      log: {
        id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'REORDER',
        sku,
        title: `Reorder Failed: [${sku}] not found`,
        details: 'Cannot move node: key does not exist.',
        timeComplexity: 'O(1)',
      },
    };
  }

  /**
   * Sequential array from Doubly Linked List in O(N)
   */
  public toArray(): ProductItem[] {
    const result: ProductItem[] = [];
    let current = this.head;
    while (current !== null) {
      result.push({ ...current.item });
      current = current.next;
    }
    return result;
  }

  /**
   * Snapshot of Hash Table buckets and chains for visualization
   */
  public getBucketSnapshots(): BucketSnapshot[] {
    const snapshots: BucketSnapshot[] = [];
    for (let i = 0; i < this.tableSize; i++) {
      const nodes: BucketSnapshot['nodes'] = [];
      let current = this.buckets[i];
      while (current !== null) {
        nodes.push({
          sku: current.listNode.item.sku,
          name: current.listNode.item.name,
          category: current.listNode.item.category,
          price: current.listNode.item.price,
          quantity: current.listNode.item.quantity,
          nextInChain: current.next ? current.next.key : null,
        });
        current = current.next;
      }
      snapshots.push({
        bucketIndex: i,
        chainLength: nodes.length,
        nodes,
      });
    }
    return snapshots;
  }

  /**
   * Snapshot of Doubly Linked List for visualization
   */
  public getLinkedListSnapshot(): LinkedListSnapshot {
    const nodes: LinkedListSnapshot['nodes'] = [];
    let current = this.head;
    while (current !== null) {
      nodes.push({
        sku: current.item.sku,
        name: current.item.name,
        category: current.item.category,
        quantity: current.item.quantity,
        price: current.item.price,
        prevSku: current.prev ? current.prev.key : null,
        nextSku: current.next ? current.next.key : null,
      });
      current = current.next;
    }

    return {
      headSku: this.head ? this.head.key : null,
      tailSku: this.tail ? this.tail.key : null,
      count: this.itemCount,
      nodes,
    };
  }

  /**
   * Compute comprehensive system and data structure metrics
   */
  public getMetrics(): SystemMetrics {
    let totalQuantity = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    let current = this.head;
    while (current !== null) {
      const item = current.item;
      totalQuantity += item.quantity;
      totalInventoryValue += item.quantity * item.price;
      if (item.quantity === 0) {
        outOfStockCount++;
      } else if (item.quantity <= item.minThreshold) {
        lowStockCount++;
      }
      current = current.next;
    }

    let occupiedBuckets = 0;
    let maxChainLength = 0;
    let totalCollisions = 0;

    for (let i = 0; i < this.tableSize; i++) {
      let chainLen = 0;
      let bucketNode = this.buckets[i];
      while (bucketNode !== null) {
        chainLen++;
        bucketNode = bucketNode.next;
      }
      if (chainLen > 0) {
        occupiedBuckets++;
      }
      if (chainLen > maxChainLength) {
        maxChainLength = chainLen;
      }
      if (chainLen > 1) {
        totalCollisions += chainLen - 1;
      }
    }

    const loadFactor = this.tableSize > 0 ? this.itemCount / this.tableSize : 0;

    return {
      totalItems: this.itemCount,
      totalQuantity,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      tableSize: this.tableSize,
      occupiedBuckets,
      maxChainLength,
      loadFactor: Math.round(loadFactor * 100) / 100,
      totalCollisions,
    };
  }

  public getTableSize(): number {
    return this.tableSize;
  }
}
