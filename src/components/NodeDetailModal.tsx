import React from 'react';
import {
  X,
  Hash,
  GitCommit,
  ArrowLeft,
  ArrowRight,
  ArrowUpToLine,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ProductItem, BucketSnapshot, LinkedListSnapshot } from '../types';
import { formatINR } from '../utils/formatters';

interface NodeDetailModalProps {
  sku: string | null;
  onClose: () => void;
  products: ProductItem[];
  buckets: BucketSnapshot[];
  linkedList: LinkedListSnapshot;
  onUpdateQuantity: (sku: string, delta: number) => void;
  onDeleteProduct: (sku: string) => void;
  onMoveToHead: (sku: string) => void;
  computeHash: (sku: string) => { rawHash: number; bucketIndex: number };
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  sku,
  onClose,
  products,
  buckets,
  linkedList,
  onUpdateQuantity,
  onDeleteProduct,
  onMoveToHead,
  computeHash,
}) => {
  if (!sku) return null;

  const product = products.find((p) => p.sku === sku);
  if (!product) return null;

  const { rawHash, bucketIndex } = computeHash(product.sku);
  const bucket = buckets.find((b) => b.bucketIndex === bucketIndex);
  const chainIndex = bucket
    ? bucket.nodes.findIndex((n) => n.sku === product.sku)
    : -1;

  const dllNode = linkedList.nodes.find((n) => n.sku === product.sku);
  const dllIndex = linkedList.nodes.findIndex((n) => n.sku === product.sku);
  const isHead = dllIndex === 0;
  const isTail = dllIndex === linkedList.nodes.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="node-detail-card"
        className="bg-white rounded-lg border border-zinc-200 max-w-lg w-full p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-zinc-900 text-white">
              <Hash className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-zinc-900">
                  {product.sku}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-medium">
                  {product.category}
                </span>
              </div>
              <h3 className="text-xs text-zinc-500 font-medium mt-0.5">
                {product.name}
              </h3>
            </div>
          </div>
          <button
            id="btn-close-node-detail"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs">
          {/* Data Structure Locations */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hash Table Bucket */}
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-md">
              <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-[11px] mb-1">
                <Hash className="w-3.5 h-3.5 text-zinc-600" />
                <span>Hash Table Location</span>
              </div>
              <div className="text-zinc-900 font-bold font-mono text-sm">
                Bucket #{bucketIndex}
              </div>
              <div className="text-zinc-500 text-[11px] mt-1">
                Chain Position: {chainIndex !== -1 ? `#${chainIndex + 1}` : 'N/A'}{' '}
                (out of {bucket?.chainLength ?? 1})
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Raw Hash: {rawHash.toLocaleString()}
              </div>
            </div>

            {/* Doubly Linked List Node */}
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-md">
              <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-[11px] mb-1">
                <GitCommit className="w-3.5 h-3.5 text-zinc-600" />
                <span>Linked List Position</span>
              </div>
              <div className="text-zinc-900 font-bold font-mono text-sm">
                Node #{dllIndex}{' '}
                {isHead && (
                  <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    HEAD
                  </span>
                )}
                {isTail && (
                  <span className="ml-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                    TAIL
                  </span>
                )}
              </div>
              <div className="text-zinc-500 text-[11px] mt-1">
                Sequence: {dllIndex + 1} of {linkedList.count} items
              </div>
            </div>
          </div>

          {/* Pointer Visualizer */}
          <div className="p-3 bg-zinc-900 text-white rounded-md font-mono text-xs space-y-2">
            <div className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
              Doubly Linked Pointers:
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-zinc-300">
                <ArrowLeft className="w-3 h-3 text-zinc-400" />
                <span>prev:</span>
                <span className="text-white font-bold">
                  {dllNode?.prevSku ?? 'null (HEAD)'}
                </span>
              </div>
              <span className="text-zinc-500">&bull;</span>
              <div className="flex items-center gap-1 text-zinc-300">
                <span>next:</span>
                <span className="text-white font-bold">
                  {dllNode?.nextSku ?? 'null (TAIL)'}
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Inventory Properties */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 border border-zinc-200 rounded">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Stock Qty</span>
              <div className="font-mono font-bold text-sm text-zinc-900 mt-0.5">
                {product.quantity}
              </div>
            </div>
            <div className="p-2 border border-zinc-200 rounded">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Price</span>
              <div className="font-mono font-bold text-xs text-zinc-900 mt-0.5">
                {formatINR(product.price)}
              </div>
            </div>
            <div className="p-2 border border-zinc-200 rounded">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Location</span>
              <div className="font-mono text-xs text-zinc-700 mt-0.5 truncate">
                {product.location}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              id="btn-modal-dec-qty"
              onClick={() => onUpdateQuantity(product.sku, -1)}
              disabled={product.quantity <= 0}
              className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-700 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-zinc-800">
              {product.quantity}
            </span>
            <button
              id="btn-modal-inc-qty"
              onClick={() => onUpdateQuantity(product.sku, 1)}
              className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isHead && (
              <button
                id="btn-modal-movetohead"
                onClick={() => {
                  onMoveToHead(product.sku);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowUpToLine className="w-3.5 h-3.5" />
                Move to Head (O(1))
              </button>
            )}

            <button
              id="btn-modal-delete"
              onClick={() => {
                onDeleteProduct(product.sku);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
