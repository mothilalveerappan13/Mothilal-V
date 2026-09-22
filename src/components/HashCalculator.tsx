import React, { useState } from 'react';
import { Calculator, ArrowRight, Sparkles, Hash, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BucketSnapshot } from '../types';

interface HashCalculatorProps {
  tableSize: number;
  buckets: BucketSnapshot[];
  onQuickSearch: (sku: string) => void;
}

export const HashCalculator: React.FC<HashCalculatorProps> = ({
  tableSize,
  buckets,
  onQuickSearch,
}) => {
  const [inputSku, setInputSku] = useState('ELEC-101');

  // Compute breakdown steps
  const breakdown = React.useMemo(() => {
    const trimmed = inputSku.trim();
    if (!trimmed) {
      return null;
    }

    let hash = 5381;
    const steps: { char: string; code: number; intermediateHash: number }[] = [];

    for (let i = 0; i < trimmed.length; i++) {
      const code = trimmed.charCodeAt(i);
      hash = ((hash << 5) + hash) + code;
      hash = hash & 0x7fffffff;
      steps.push({
        char: trimmed[i],
        code,
        intermediateHash: hash,
      });
    }

    const bucketIndex = hash % tableSize;
    const targetBucket = buckets.find((b) => b.bucketIndex === bucketIndex);
    const existingInBucket = targetBucket ? targetBucket.nodes : [];
    const isExistingKey = existingInBucket.some((n) => n.sku.toUpperCase() === trimmed.toUpperCase());
    const isCollision = existingInBucket.length > 0 && !isExistingKey;

    return {
      rawHash: hash,
      bucketIndex,
      steps,
      targetBucket,
      existingInBucket,
      isExistingKey,
      isCollision,
    };
  }, [inputSku, tableSize, buckets]);

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-zinc-100 text-zinc-800">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Interactive SKU Hash Calculator</h3>
            <p className="text-xs text-zinc-500">
              Live mathematical step-by-step hashing demonstration (DJB2 Algorithm)
            </p>
          </div>
        </div>

        {/* Preset quick test pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-400 text-[11px]">Try:</span>
          {['ELEC-101', 'COMP-201', 'COLLISION-A', 'NEW-ITEM'].map((preset) => (
            <button
              key={preset}
              id={`btn-preset-${preset}`}
              onClick={() => setInputSku(preset)}
              className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-mono text-[11px] transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label htmlFor="hash-calculator-input" className="block text-xs font-semibold text-zinc-700 mb-1">
          Target SKU String
        </label>
        <div className="flex gap-2">
          <input
            id="hash-calculator-input"
            type="text"
            value={inputSku}
            onChange={(e) => setInputSku(e.target.value)}
            placeholder="Type any SKU identifier..."
            className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
          />
          {breakdown?.isExistingKey && (
            <button
              id="btn-calc-lookup"
              onClick={() => onQuickSearch(inputSku.trim())}
              className="px-3 py-2 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Search in Inventory
            </button>
          )}
        </div>
      </div>

      {/* Calculation Output */}
      {breakdown && (
        <div className="space-y-3 pt-2">
          {/* Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Raw 31-bit Hash</span>
              <div className="font-mono font-bold text-sm text-zinc-900 mt-0.5">
                {breakdown.rawHash.toLocaleString()}
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Formula</span>
              <div className="font-mono text-xs text-zinc-700 mt-0.5">
                {breakdown.rawHash} % {tableSize}
              </div>
            </div>

            <div className="bg-zinc-900 text-white p-2.5 rounded">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Destination Bucket</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                Bucket #{breakdown.bucketIndex}
              </div>
            </div>
          </div>

          {/* Collision or Status notice */}
          {breakdown.isExistingKey ? (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Direct Match:</strong> SKU &ldquo;{inputSku.trim()}&rdquo; already exists in Bucket #{breakdown.bucketIndex} chain. Hash table allows O(1) lookup.
              </span>
            </div>
          ) : breakdown.isCollision ? (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Hash Collision:</strong> Bucket #{breakdown.bucketIndex} already holds {breakdown.existingInBucket.length} item(s) ({breakdown.existingInBucket.map(i => i.sku).join(', ')}). If inserted, this new SKU will be prepended to this bucket&apos;s linked list chain in O(1).
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong>Clean Placement:</strong> Bucket #{breakdown.bucketIndex} is currently empty. Inserting this item takes O(1) direct slot assignment.
              </span>
            </div>
          )}

          {/* Character-by-character calculation drawer */}
          <details className="text-xs group">
            <summary className="cursor-pointer font-medium text-zinc-600 hover:text-zinc-900 py-1">
              Show Character ASCII Bit-Shift Steps ({breakdown.steps.length} chars)
            </summary>
            <div className="mt-2 overflow-x-auto border border-zinc-200 rounded bg-zinc-50 p-2 font-mono text-[11px]">
              <div className="text-zinc-500 mb-1">Initial Seed: hash = 5381</div>
              {breakdown.steps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 py-0.5 text-zinc-700">
                  <span className="text-zinc-400 w-6">[{idx}]</span>
                  <span className="w-8 font-bold">&lsquo;{s.char}&rsquo;</span>
                  <span className="text-zinc-400">(ASCII {s.code})</span>
                  <span>&rarr;</span>
                  <span>((hash &lt;&lt; 5) + hash) + {s.code} =</span>
                  <span className="font-semibold text-zinc-900">{s.intermediateHash}</span>
                </div>
              ))}
              <div className="mt-1.5 pt-1 border-t border-zinc-200 text-zinc-900 font-bold">
                Final modulo: {breakdown.rawHash} % {tableSize} = Bucket {breakdown.bucketIndex}
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
