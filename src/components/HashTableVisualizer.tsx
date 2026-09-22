import React from 'react';
import {
  Hash,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { BucketSnapshot, SystemMetrics } from '../types';
import { formatINR } from '../utils/formatters';

interface HashTableVisualizerProps {
  buckets: BucketSnapshot[];
  metrics: SystemMetrics;
  highlightedSku: string | null;
  onSelectSku: (sku: string) => void;
  onOpenAddModal: () => void;
}

export const HashTableVisualizer: React.FC<HashTableVisualizerProps> = ({
  buckets,
  metrics,
  highlightedSku,
  onSelectSku,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview & Theory Banner */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-zinc-900 text-white">
                <Hash className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-zinc-900">
                Hash Table Bucket Array with Separate Chaining
              </h2>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
              Every inventory product SKU is hashed using a deterministic rolling hash function and mapped to a bucket index:
              <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                index = hash(SKU) % {metrics.tableSize}
              </code>.
              When multiple SKUs resolve to the same index (a collision), they form a singly linked bucket chain, preserving O(1) average lookup times.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-md text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Table Size (M)</div>
              <div className="text-base font-bold text-zinc-900 font-mono">{metrics.tableSize}</div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-md text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Load Factor (α)</div>
              <div className="text-base font-bold text-zinc-900 font-mono">
                {metrics.loadFactor}
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-md text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Occupied</div>
              <div className="text-base font-bold text-zinc-900 font-mono">
                {metrics.occupiedBuckets} / {metrics.tableSize}
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-md text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase">Collisions</div>
              <div className="text-base font-bold text-amber-700 font-mono">
                {metrics.totalCollisions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buckets Grid */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">
              Bucket Array [0 ... {metrics.tableSize - 1}]
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>1 Item (No Collision)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>2+ Items (Collision Chain)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
              <span>Empty</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {buckets.map((bucket) => {
            const hasCollision = bucket.chainLength > 1;
            const isEmpty = bucket.chainLength === 0;

            return (
              <div
                key={bucket.bucketIndex}
                id={`bucket-row-${bucket.bucketIndex}`}
                className={`border rounded-lg p-3 transition-colors ${
                  isEmpty
                    ? 'border-zinc-200 bg-zinc-50/50'
                    : hasCollision
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Bucket Index Indicator */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center w-24 shrink-0 bg-white border border-zinc-200 rounded p-2 text-center shadow-2xs">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Bucket
                    </span>
                    <span className="font-mono text-base font-bold text-zinc-900">
                      [{bucket.bucketIndex}]
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {bucket.chainLength === 0
                        ? 'empty'
                        : `${bucket.chainLength} ${
                            bucket.chainLength === 1 ? 'node' : 'nodes'
                          }`}
                    </span>
                  </div>

                  {/* Chain Nodes */}
                  <div className="flex-1 overflow-x-auto py-1">
                    {isEmpty ? (
                      <div className="flex items-center gap-2 text-xs text-zinc-400 italic py-2">
                        <span>null (Pointer is null — bucket is currently empty)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {bucket.nodes.map((node, nodeIdx) => {
                          const isHighlighted = highlightedSku === node.sku;

                          return (
                            <React.Fragment key={node.sku}>
                              {nodeIdx > 0 && (
                                <div className="flex items-center text-amber-600 shrink-0">
                                  <ArrowRight className="w-4 h-4" />
                                  <span className="text-[9px] font-mono font-medium px-1">
                                    next
                                  </span>
                                </div>
                              )}

                              <div
                                id={`node-card-${node.sku}`}
                                onClick={() => onSelectSku(node.sku)}
                                className={`shrink-0 cursor-pointer rounded-md p-3 border transition-all ${
                                  isHighlighted
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 shadow-sm'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs'
                                }`}
                                style={{ minWidth: '220px' }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-xs text-zinc-900">
                                    {node.sku}
                                  </span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                                    {node.category}
                                  </span>
                                </div>

                                <div className="text-xs font-medium text-zinc-800 truncate mt-1">
                                  {node.name}
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
                                  <span>Units: <strong className="text-zinc-800">{node.quantity}</strong></span>
                                  <span>{formatINR(node.price, false)}</span>
                                </div>

                                <div className="mt-1.5 flex items-center justify-between text-[10px] text-blue-700 bg-blue-50/70 px-1.5 py-0.5 rounded">
                                  <span>→ Pointer to DLL Node</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}

                        {/* End of chain */}
                        <div className="flex items-center text-zinc-400 shrink-0 pl-1">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span className="font-mono text-[10px] ml-1">null</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
