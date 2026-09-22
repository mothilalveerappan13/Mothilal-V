import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Minus,
  Trash2,
  ArrowUpToLine,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  PackageX,
  Filter,
} from 'lucide-react';
import { ProductItem } from '../types';
import { formatINR } from '../utils/formatters';

interface InventoryTableProps {
  products: ProductItem[];
  onSearch: (sku: string) => void;
  onUpdateQuantity: (sku: string, delta: number) => void;
  onDeleteProduct: (sku: string) => void;
  onMoveToHead: (sku: string) => void;
  onInspectItem: (sku: string) => void;
  onOpenAddModal: () => void;
  computeHash: (sku: string) => { rawHash: number; bucketIndex: number };
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onSearch,
  onUpdateQuantity,
  onDeleteProduct,
  onMoveToHead,
  onInspectItem,
  onOpenAddModal,
  computeHash,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<'dll-order' | 'name' | 'price' | 'quantity'>('dll-order');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' || product.category === selectedCategory;

        const matchesStock =
          !onlyLowStock || product.quantity <= product.minThreshold;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        return 0; // default Doubly Linked List sequence
      });
  }, [products, searchTerm, selectedCategory, onlyLowStock, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search by SKU / Name */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="inventory-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU, Product Name, or Location... (Press Enter to trigger Hash Lookup)"
                className="w-full pl-9 pr-24 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 focus:bg-white transition-all"
              />
              {searchTerm.trim() && (
                <button
                  type="submit"
                  id="btn-trigger-hash-lookup"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  O(1) Hash
                </button>
              )}
            </div>
          </form>

          {/* Filters and Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                id="select-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by product category"
                className="bg-transparent border-none text-zinc-700 font-medium focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Toggle */}
            <button
              id="btn-filter-low-stock"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                onlyLowStock
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Low Stock Only
            </button>

            {/* Sequence / Sort Toggle */}
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                id="select-sort-order"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort product ordering"
                className="bg-transparent border-none text-zinc-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="dll-order">Doubly Linked List (Sequential Order)</option>
                <option value="name">Product Name (A-Z)</option>
                <option value="price">Price (High to Low)</option>
                <option value="quantity">Stock Quantity (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informative notice about Doubly Linked List Order */}
        {sortBy === 'dll-order' && (
          <div className="mt-2.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>
              <strong>Note:</strong> Items are currently displayed in direct <strong>Doubly Linked List Traversal Sequence</strong> (Head to Tail).
            </span>
            <span className="text-[11px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
              Traversed in O(N) without visiting empty hash buckets
            </span>
          </div>
        )}
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <PackageX className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-800">No inventory products found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No products match the active filters or search criteria. You can add a new item to the data structure or clear filters.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                id="btn-clear-search"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setOnlyLowStock(false);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                id="btn-add-product-empty"
                onClick={onOpenAddModal}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Add New Product
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">SKU & Hash Bucket</th>
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Price / Valuation</th>
                  <th className="py-3 px-4 text-center">Adjust Units</th>
                  <th className="py-3 px-4 text-right">Data Structure Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredProducts.map((product, index) => {
                  const { bucketIndex } = computeHash(product.sku);
                  const isOutOfStock = product.quantity === 0;
                  const isLowStock = !isOutOfStock && product.quantity <= product.minThreshold;

                  return (
                    <tr
                      key={product.sku}
                      id={`inventory-row-${product.sku}`}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* SKU & Bucket */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-semibold text-zinc-900">
                            {product.sku}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-600 border border-zinc-200">
                              Bucket #{bucketIndex}
                            </span>
                            {index === 0 && sortBy === 'dll-order' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                HEAD
                              </span>
                            )}
                            {index === filteredProducts.length - 1 && sortBy === 'dll-order' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                                TAIL
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-900">{product.name}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {product.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">
                        {product.location}
                      </td>

                      {/* Stock Level with Badges */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold text-sm ${
                              isOutOfStock
                                ? 'text-red-700'
                                : isLowStock
                                ? 'text-amber-700'
                                : 'text-zinc-900'
                            }`}
                          >
                            {product.quantity}
                          </span>
                          <span className="text-zinc-400 text-[11px]">
                            (min: {product.minThreshold})
                          </span>
                        </div>
                        <div className="mt-1">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3" /> Low Stock Warning
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Healthy Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price & Valuation */}
                      <td className="py-3 px-4">
                        <div className="text-zinc-900 font-semibold font-mono">
                          {formatINR(product.price)}
                        </div>
                        <div className="text-zinc-400 text-[10px]">
                          Total: {formatINR(product.price * product.quantity)}
                        </div>
                      </td>

                      {/* Quick Adjust Units */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-dec-${product.sku}`}
                            onClick={() => onUpdateQuantity(product.sku, -1)}
                            disabled={product.quantity <= 0}
                            title="Decrement quantity by 1 (O(1) Hash Table Lookup & in-place update)"
                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-700 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-semibold text-zinc-900">
                            {product.quantity}
                          </span>
                          <button
                            id={`btn-inc-${product.sku}`}
                            onClick={() => onUpdateQuantity(product.sku, 1)}
                            title="Increment quantity by 1 (O(1) Hash Table Lookup & in-place update)"
                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Data Structure Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-movetohead-${product.sku}`}
                            onClick={() => onMoveToHead(product.sku)}
                            title="Promote to Head of Doubly Linked List in O(1)"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-[11px] transition-colors cursor-pointer"
                          >
                            <ArrowUpToLine className="w-3 h-3 text-zinc-500" />
                            To Head
                          </button>

                          <button
                            id={`btn-inspect-${product.sku}`}
                            onClick={() => onInspectItem(product.sku)}
                            title="Inspect in Hash Table and Doubly Linked List Visualizer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Inspect
                          </button>

                          <button
                            id={`btn-delete-${product.sku}`}
                            onClick={() => onDeleteProduct(product.sku)}
                            title="Delete item in O(1) by unlinking bucket chain and doubly linked list pointers"
                            className="p-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
