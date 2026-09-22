# Inventory Management System (Hash Table & Doubly Linked List)

A high-performance Inventory Management System web application engineered with a **Hash Table** (Separate Chaining with DJB2 rolling hash) and a **Doubly Linked List** (bidirectional sequential memory ordering) with Indian Rupee (INR - ₹) currency formatting.

Also includes a standalone ANSI C implementation (`inventory_system.c`).

---

## Architecture Overview

1. **Hash Table with Separate Chaining ($O(1)$ Average Lookup)**:
   - Computes polynomial rolling hash (DJB2) mapping product SKUs to buckets.
   - Separate chaining resolves hash collisions in $O(1)$ prepend time.

2. **Doubly Linked List ($O(1)$ Deletions and Sequential Ordering)**:
   - Maintains sequence of stock items with explicit `prev` and `next` pointers.
   - Head and tail pointers allow $O(1)$ insertions.
   - Splicing and removals occur in $O(1)$ time without shifting array elements.

3. **Hybrid Cross-Pointers**:
   - Each hash table bucket node points directly to its corresponding node in the Doubly Linked List.
   - Searching by SKU gives the node address in $O(1)$ average time, enabling $O(1)$ in-place updates, priority promotions to head, or deletions.

---

## Running the Web Application (React + Vite)

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Production Build
```bash
npm run build
```

---

## Running the C Implementation (`inventory_system.c`)

### Compile with GCC:
```bash
gcc -O2 -Wall inventory_system.c -o inventory_system
```

### Run the executable:
```bash
./inventory_system
```
