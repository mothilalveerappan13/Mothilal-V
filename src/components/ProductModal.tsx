import React, { useState, useEffect } from 'react';
import { X, Plus, Hash, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: ProductItem) => void;
  computeHash: (sku: string) => { rawHash: number; bucketIndex: number };
  tableSize: number;
}

const CATEGORIES = [
  'Electronics',
  'Components',
  'Networking',
  'Accessories',
  'Tools',
  'Office Supplies',
  'Storage',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  computeHash,
  tableSize,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('2499');
  const [quantity, setQuantity] = useState('20');
  const [minThreshold, setMinThreshold] = useState('5');
  const [location, setLocation] = useState('Aisle 2, Bin A4');
  const [error, setError] = useState<string | null>(null);

  // Compute live hash preview
  const hashPreview = React.useMemo(() => {
    if (!sku.trim()) return null;
    return computeHash(sku.trim().toUpperCase());
  }, [sku, computeHash]);

  useEffect(() => {
    if (isOpen) {
      // Generate a fresh random SKU suggestion
      const randomNum = Math.floor(100 + Math.random() * 900);
      setSku(`SKU-${randomNum}`);
      setName('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSku = sku.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanSku) {
      setError('SKU is required.');
      return;
    }
    if (!cleanName) {
      setError('Product name is required.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid positive number.');
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setError('Quantity must be a valid non-negative integer.');
      return;
    }

    const parsedThreshold = parseInt(minThreshold, 10);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      setError('Min threshold must be a valid non-negative integer.');
      return;
    }

    onSubmit({
      sku: cleanSku,
      name: cleanName,
      category,
      price: parsedPrice,
      quantity: parsedQty,
      minThreshold: parsedThreshold,
      location: location.trim() || 'General Warehouse',
      updatedAt: Date.now(),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-modal-card"
        className="bg-white rounded-lg border border-zinc-200 max-w-lg w-full p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Add Inventory Product</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Inserts node into Doubly Linked List and indexes by SKU in Hash Table
            </p>
          </div>
          <button
            id="btn-close-product-modal"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* SKU Field & Live Hash Preview */}
          <div>
            <label htmlFor="input-product-sku" className="block font-semibold text-zinc-700 mb-1">
              Product SKU / Unique Key
            </label>
            <div className="flex gap-2">
              <input
                id="input-product-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. ELEC-999"
                className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                required
              />
              <button
                type="button"
                id="btn-generate-sku"
                onClick={() => setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`)}
                className="px-2.5 py-2 text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                Random SKU
              </button>
            </div>

            {hashPreview && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="font-mono">
                  Hash: {hashPreview.rawHash} % {tableSize} &rarr;
                </span>
                <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-zinc-900 text-white text-[10px]">
                  Bucket #{hashPreview.bucketIndex}
                </span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="input-product-name" className="block font-semibold text-zinc-700 mb-1">
              Product Name
            </label>
            <input
              id="input-product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mechanical Gaming Keyboard"
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              required
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-modal-category" className="block font-semibold text-zinc-700 mb-1">
                Category
              </label>
              <select
                id="select-modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="input-modal-location" className="block font-semibold text-zinc-700 mb-1">
                Warehouse Location
              </label>
              <input
                id="input-modal-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle 3, Shelf B1"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Price, Quantity, Threshold */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="input-modal-price" className="block font-semibold text-zinc-700 mb-1">
                Unit Price (₹)
              </label>
              <input
                id="input-modal-price"
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2499"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="input-modal-quantity" className="block font-semibold text-zinc-700 mb-1">
                Stock Quantity
              </label>
              <input
                id="input-modal-quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="input-modal-threshold" className="block font-semibold text-zinc-700 mb-1">
                Low Threshold
              </label>
              <input
                id="input-modal-threshold"
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-product-modal"
              className="px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 font-medium transition-colors cursor-pointer shadow-xs"
            >
              Insert Item (O(1))
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
