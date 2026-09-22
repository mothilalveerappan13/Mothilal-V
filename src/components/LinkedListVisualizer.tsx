import React, { useState } from 'react';
import {
  GitCommit,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  ArrowUpToLine,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { LinkedListSnapshot } from '../types';
import { formatINR } from '../utils/formatters';

interface LinkedListVisualizerProps {
  linkedList: LinkedListSnapshot;
  highlightedSku: string | null;
  onSelectSku: (sku: string) => void;
  onMoveToHead: (sku: string) => void;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  linkedList,
  highlightedSku,
  onSelectSku,
  onMoveToHead,
}) => {
  const [traversalIndex, setTraversalIndex] = useState<number | null>(null);

  const handleStepForward = () => {
    if (linkedList.nodes.length === 0) return;
    if (traversalIndex === null || traversalIndex >= linkedList.nodes.length - 1) {
      setTraversalIndex(0);
      onSelectSku(linkedList.nodes[0].sku);
    } else {
      const nextIdx = traversalIndex + 1;
      setTraversalIndex(nextIdx);
      onSelectSku(linkedList.nodes[nextIdx].sku);
    }
  };

  const handleResetTraversal = () => {
    setTraversalIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-zinc-900 text-white">
                <GitCommit className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-zinc-900">
                Doubly Linked List (Sequential Inventory Memory Layout)
              </h2>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
              Every inventory item is a Doubly Linked List node maintaining explicit
              <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                prev
              </code>
              and
              <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                next
              </code>
              memory pointers. This allows O(1) removals and insertions anywhere in the list without shifting array elements, and guarantees strictly linear O(N) traversal without visiting empty hash table buckets.
            </p>
          </div>

          {/* Controls for Sequential Traversal & Head Promotion */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-step-traverse-dll"
              onClick={handleStepForward}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              {traversalIndex === null ? 'Traverse from Head' : 'Step Next Node'}
            </button>

            {traversalIndex !== null && (
              <button
                id="btn-reset-traversal"
                onClick={handleResetTraversal}
                className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
              >
                Clear Traversal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Doubly Linked List Chain */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">
              Pointer Sequence ({linkedList.count} Nodes)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-medium">
              HEAD: {linkedList.headSku ?? 'null'}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-medium">
              TAIL: {linkedList.tailSku ?? 'null'}
            </span>
          </div>
        </div>

        {linkedList.nodes.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs">
            The Doubly Linked List is currently empty. Add products to visualize nodes and pointers.
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 pt-2">
            <div className="flex items-stretch gap-3 min-w-max">
              {/* Head Pointer Label */}
              <div className="flex flex-col justify-center items-center px-3 py-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center shrink-0">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  HEAD
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 mt-1">
                  &rarr;
                </span>
                <span className="text-[10px] text-emerald-700 mt-1">
                  Starts at index 0
                </span>
              </div>

              {linkedList.nodes.map((node, index) => {
                const isHead = index === 0;
                const isTail = index === linkedList.nodes.length - 1;
                const isHighlighted = highlightedSku === node.sku;
                const isTraversed = traversalIndex === index;

                return (
                  <React.Fragment key={node.sku}>
                    {/* Node Box */}
                    <div
                      id={`dll-node-${node.sku}`}
                      onClick={() => onSelectSku(node.sku)}
                      className={`relative w-64 p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between shrink-0 ${
                        isHighlighted || isTraversed
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-400 shadow-md'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Node Header */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono font-bold text-sm text-zinc-900">
                            {node.sku}
                          </span>
                          <div className="flex items-center gap-1">
                            {isHead && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                Head
                              </span>
                            )}
                            {isTail && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase">
                                Tail
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-100 text-zinc-600">
                              #{index}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs font-medium text-zinc-800 line-clamp-1">
                          {node.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {node.category} &bull; {formatINR(node.price, false)}
                        </div>
                      </div>

                      {/* Pointer Addresses */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-1 text-[11px] font-mono">
                        <div className="flex items-center justify-between text-zinc-500">
                          <span className="text-[10px] uppercase text-zinc-400">prev:</span>
                          <span className={node.prevSku ? 'text-zinc-800 font-semibold' : 'text-zinc-400 italic'}>
                            {node.prevSku ?? 'null (HEAD)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-500">
                          <span className="text-[10px] uppercase text-zinc-400">next:</span>
                          <span className={node.nextSku ? 'text-zinc-800 font-semibold' : 'text-zinc-400 italic'}>
                            {node.nextSku ?? 'null (TAIL)'}
                          </span>
                        </div>
                      </div>

                      {/* Stock and Promote Action */}
                      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-xs text-zinc-600">
                          Qty: <strong className="text-zinc-900">{node.quantity}</strong>
                        </span>

                        {!isHead && (
                          <button
                            id={`btn-dll-movetohead-${node.sku}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveToHead(node.sku);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors cursor-pointer"
                            title="Unlink and relink to HEAD in O(1)"
                          >
                            <ArrowUpToLine className="w-3 h-3" />
                            To Head
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bidirectional Pointer Arrow between nodes */}
                    {!isTail && (
                      <div className="flex flex-col justify-center items-center text-zinc-400 shrink-0 px-1">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                          <ArrowLeft className="w-3 h-3 text-zinc-400" />
                          <span>pointers</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Tail Pointer Label */}
              <div className="flex flex-col justify-center items-center px-3 py-4 bg-blue-50 border border-blue-200 rounded-lg text-center shrink-0">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  TAIL
                </span>
                <span className="text-xs font-mono font-bold text-blue-900 mt-1">
                  &larr;
                </span>
                <span className="text-[10px] text-blue-700 mt-1">
                  Ends sequence
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
