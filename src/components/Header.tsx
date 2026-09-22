import React, { useState } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  Plus,
  RotateCcw,
  Sparkles,
  GitFork,
  Hash,
  Code2,
  Download,
  Loader2,
} from 'lucide-react';
import { SystemMetrics } from '../types';
import { formatINR } from '../utils/formatters';
import { exportProjectAsZip } from '../utils/zipExporter';

interface HeaderProps {
  metrics: SystemMetrics;
  onOpenAddModal: () => void;
  onResetData: () => void;
  onTriggerCollisionDemo: () => void;
  activeView: 'inventory' | 'datastructure' | 'logs' | 'ccode';
  setActiveView: (view: 'inventory' | 'datastructure' | 'logs' | 'ccode') => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onOpenAddModal,
  onResetData,
  onTriggerCollisionDemo,
  activeView,
  setActiveView,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await exportProjectAsZip();
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Brand and Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                  Inventory Management System
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                  <Hash className="w-3 h-3 text-zinc-500" />
                  Hash Table + Linked List
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                O(1) SKU lookups via Hash Table separate chaining & O(1) sequential ordering via Doubly Linked List
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-collision-demo"
              onClick={onTriggerCollisionDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Add an item crafted to collide with an existing bucket to demonstrate separate chaining"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Simulate Collision
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              Reset
            </button>

            <button
              id="btn-download-project-zip"
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Download entire project source code and C implementation as a ZIP archive"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Packaging ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download ZIP</span>
                </>
              )}
            </button>

            <button
              id="btn-add-product-header"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Quick Metrics Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-zinc-100 pt-2 pb-3 gap-3">
          <nav className="flex items-center gap-1" aria-label="View selection">
            <button
              id="tab-inventory-view"
              onClick={() => setActiveView('inventory')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'inventory'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Package className="w-4 h-4" />
              Inventory Catalog
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                  activeView === 'inventory'
                    ? 'bg-zinc-700 text-zinc-200'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {metrics.totalItems}
              </span>
            </button>

            <button
              id="tab-datastructure-view"
              onClick={() => setActiveView('datastructure')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'datastructure'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <GitFork className="w-4 h-4" />
              Data Structure Visualizer
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                  activeView === 'datastructure'
                    ? 'bg-zinc-700 text-zinc-200'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                Buckets & Pointers
              </span>
            </button>

            <button
              id="tab-logs-view"
              onClick={() => setActiveView('logs')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'logs'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Hash className="w-4 h-4" />
              Algorithm Tracer
            </button>

            <button
              id="tab-ccode-view"
              onClick={() => setActiveView('ccode')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'ccode'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-500" />
              C Code Implementation
            </button>
          </nav>

          {/* Compact System Metrics */}
          <div className="flex items-center flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded">
              <span className="text-zinc-400">Total Units:</span>
              <span className="font-semibold text-zinc-900">{metrics.totalQuantity}</span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded">
              <span className="text-zinc-400">Valuation:</span>
              <span className="font-semibold text-zinc-900">
                {formatINR(metrics.totalInventoryValue)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded">
              <span className="text-zinc-400">Load Factor (α):</span>
              <span className="font-semibold text-zinc-900">
                {metrics.loadFactor} ({metrics.occupiedBuckets}/{metrics.tableSize} buckets)
              </span>
            </div>

            {metrics.lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium">{metrics.lowStockCount} Low Stock</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
