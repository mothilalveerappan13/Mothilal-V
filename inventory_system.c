/**
 * ============================================================================
 * Inventory Management System in C
 * Engineered with:
 *   1. Hash Table with Separate Chaining (O(1) average key-to-node lookup)
 *   2. Doubly Linked List (O(1) insertion, deletion & sequential ordering)
 *   3. Indian Rupee (INR - Rs. / ₹) Currency Standard
 * ============================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DEFAULT_TABLE_SIZE 13
#define MAX_STR_LEN 128
#define SKU_LEN 32

/* Product Structure */
typedef struct {
    char sku[SKU_LEN];
    char name[MAX_STR_LEN];
    char category[MAX_STR_LEN];
    double price;            /* In Indian Rupees (INR - Rs.) */
    int quantity;
    int min_threshold;
    char location[MAX_STR_LEN];
} Product;

/* Doubly Linked List Node */
typedef struct DoublyListNode {
    Product product;
    struct DoublyListNode *prev;
    struct DoublyListNode *next;
} DoublyListNode;

/* Hash Table Bucket Node (Separate Chaining) */
typedef struct HashBucketNode {
    char sku[SKU_LEN];
    DoublyListNode *list_node; /* Direct pointer to Doubly Linked List node */
    struct HashBucketNode *next;
} HashBucketNode;

/* Complete Inventory Management System State */
typedef struct {
    int table_size;
    HashBucketNode **buckets;
    DoublyListNode *head;
    DoublyListNode *tail;
    int item_count;
} InventorySystem;

/**
 * DJB2 Polynomial Rolling Hash Function
 * Computes hash and maps to [0 ... table_size - 1]
 */
unsigned int hash_djb2(const char *key, int table_size) {
    unsigned long hash = 5381;
    int c;
    while ((c = *key++)) {
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    }
    return (unsigned int)(hash % (unsigned long)table_size);
}

/**
 * Initialize Inventory System Memory
 */
InventorySystem* create_inventory(int table_size) {
    InventorySystem *inv = (InventorySystem*)malloc(sizeof(InventorySystem));
    if (!inv) {
        perror("Failed to allocate inventory system");
        exit(EXIT_FAILURE);
    }
    inv->table_size = table_size;
    inv->item_count = 0;
    inv->head = NULL;
    inv->tail = NULL;
    inv->buckets = (HashBucketNode**)calloc(table_size, sizeof(HashBucketNode*));
    if (!inv->buckets) {
        perror("Failed to allocate bucket table");
        free(inv);
        exit(EXIT_FAILURE);
    }
    return inv;
}

/**
 * Search product by SKU
 * Time Complexity: O(1) average time via Hash Table
 */
DoublyListNode* search_product(InventorySystem *inv, const char *sku) {
    if (!inv || !sku) return NULL;
    unsigned int bucket_idx = hash_djb2(sku, inv->table_size);
    HashBucketNode *curr = inv->buckets[bucket_idx];

    while (curr != NULL) {
        if (strcmp(curr->sku, sku) == 0) {
            return curr->list_node; /* Direct O(1) pointer to Doubly Linked List node */
        }
        curr = curr->next;
    }
    return NULL;
}

/**
 * Insert or Update Product
 * If SKU exists: updates fields in O(1)
 * If new SKU:
 *   - Appends to Doubly Linked List tail in O(1)
 *   - Prepends to Hash Table bucket chain in O(1)
 */
int insert_product(InventorySystem *inv, Product prod) {
    if (!inv) return 0;

    unsigned int bucket_idx = hash_djb2(prod.sku, inv->table_size);
    HashBucketNode *curr = inv->buckets[bucket_idx];

    /* 1. Check if SKU already exists */
    while (curr != NULL) {
        if (strcmp(curr->sku, prod.sku) == 0) {
            /* Update existing product */
            curr->list_node->product = prod;
            printf("[UPDATE] SKU '%s' updated in Bucket #%u in O(1).\n", prod.sku, bucket_idx);
            return 1;
        }
        curr = curr->next;
    }

    /* 2. Create new Doubly Linked List Node */
    DoublyListNode *new_list_node = (DoublyListNode*)malloc(sizeof(DoublyListNode));
    if (!new_list_node) {
        perror("Memory allocation failure for list node");
        return 0;
    }
    new_list_node->product = prod;
    new_list_node->next = NULL;
    new_list_node->prev = inv->tail;

    if (inv->head == NULL) {
        inv->head = new_list_node;
        inv->tail = new_list_node;
    } else {
        inv->tail->next = new_list_node;
        inv->tail = new_list_node;
    }

    /* 3. Create Hash Table Bucket Node (Prepend to bucket chain) */
    HashBucketNode *new_bucket_node = (HashBucketNode*)malloc(sizeof(HashBucketNode));
    if (!new_bucket_node) {
        perror("Memory allocation failure for bucket node");
        return 0;
    }
    strncpy(new_bucket_node->sku, prod.sku, SKU_LEN - 1);
    new_bucket_node->sku[SKU_LEN - 1] = '\0';
    new_bucket_node->list_node = new_list_node;
    new_bucket_node->next = inv->buckets[bucket_idx];
    inv->buckets[bucket_idx] = new_bucket_node;

    inv->item_count++;
    printf("[INSERT] SKU '%s' inserted into Bucket #%u (O(1)).\n", prod.sku, bucket_idx);
    return 1;
}

/**
 * Delete product by SKU
 * 1. Locate node in Hash Table bucket in O(1) avg
 * 2. Unlink from Doubly Linked List in O(1)
 * 3. Unlink from Hash Table Bucket chain in O(1)
 */
int delete_product(InventorySystem *inv, const char *sku) {
    if (!inv || !sku) return 0;

    unsigned int bucket_idx = hash_djb2(sku, inv->table_size);
    HashBucketNode *curr = inv->buckets[bucket_idx];
    HashBucketNode *prev_bucket_node = NULL;

    while (curr != NULL) {
        if (strcmp(curr->sku, sku) == 0) {
            DoublyListNode *list_node = curr->list_node;

            /* Step A: Unlink from Doubly Linked List in O(1) */
            if (list_node->prev != NULL) {
                list_node->prev->next = list_node->next;
            } else {
                inv->head = list_node->next; /* Removed head */
            }

            if (list_node->next != NULL) {
                list_node->next->prev = list_node->prev;
            } else {
                inv->tail = list_node->prev; /* Removed tail */
            }
            free(list_node);

            /* Step B: Unlink from Hash Table Bucket chain in O(1) */
            if (prev_bucket_node != NULL) {
                prev_bucket_node->next = curr->next;
            } else {
                inv->buckets[bucket_idx] = curr->next;
            }
            free(curr);

            inv->item_count--;
            printf("[DELETE] SKU '%s' unlinked from DLL & Hash Table in O(1).\n", sku);
            return 1;
        }
        prev_bucket_node = curr;
        curr = curr->next;
    }

    printf("[ERROR] SKU '%s' not found for deletion.\n", sku);
    return 0;
}

/**
 * Update stock quantity
 * Direct pointer update via hash table in O(1)
 */
int update_quantity(InventorySystem *inv, const char *sku, int delta) {
    DoublyListNode *node = search_product(inv, sku);
    if (!node) {
        printf("[ERROR] SKU '%s' not found.\n", sku);
        return 0;
    }
    int old_qty = node->product.quantity;
    node->product.quantity += delta;
    if (node->product.quantity < 0) node->product.quantity = 0;

    printf("[STOCK] SKU '%s': Quantity %d -> %d\n", sku, old_qty, node->product.quantity);
    return 1;
}

/**
 * Move item to HEAD of Doubly Linked List
 * Demonstrates O(1) priority promotion / LRU ordering
 */
int move_to_head(InventorySystem *inv, const char *sku) {
    DoublyListNode *node = search_product(inv, sku);
    if (!node || node == inv->head) return 1; /* Already at head */

    /* Unlink node from current position */
    if (node->prev) node->prev->next = node->next;
    if (node->next) node->next->prev = node->prev;
    else inv->tail = node->prev;

    /* Re-link at head */
    node->prev = NULL;
    node->next = inv->head;
    if (inv->head) inv->head->prev = node;
    inv->head = node;

    printf("[REORDER] Moved SKU '%s' to HEAD of Doubly Linked List in O(1).\n", sku);
    return 1;
}

/**
 * Sequential Traversal of Inventory in O(N)
 * Traverses using Doubly Linked List without touching empty hash buckets!
 */
void display_inventory_sequential(const InventorySystem *inv) {
    if (!inv || !inv->head) {
        printf("\nInventory is empty.\n");
        return;
    }

    printf("\n========================================================================================\n");
    printf("SEQUENTIAL INVENTORY (Doubly Linked List Traversal from HEAD to TAIL)\n");
    printf("========================================================================================\n");
    printf("%-10s %-36s %-14s %-12s %-8s %-8s\n", 
           "SKU", "Product Name", "Category", "Price (INR)", "Stock", "Status");
    printf("----------------------------------------------------------------------------------------\n");

    DoublyListNode *curr = inv->head;
    double total_valuation = 0.0;
    int total_units = 0;

    while (curr != NULL) {
        Product p = curr->product;
        total_valuation += (p.price * p.quantity);
        total_units += p.quantity;

        const char *status = "HEALTHY";
        if (p.quantity == 0) status = "OUT OF STOCK";
        else if (p.quantity <= p.min_threshold) status = "LOW STOCK";

        printf("%-10s %-36s %-14s Rs.%-9.2f %-8d %-8s\n",
               p.sku, p.name, p.category, p.price, p.quantity, status);

        curr = curr->next;
    }
    printf("----------------------------------------------------------------------------------------\n");
    printf("Total Items: %d | Total Units: %d | Total Valuation: Rs. %.2f\n",
           inv->item_count, total_units, total_valuation);
    printf("========================================================================================\n\n");
}

/**
 * Display Hash Table Buckets and Separate Collision Chains
 */
void display_hash_table_buckets(const InventorySystem *inv) {
    if (!inv) return;

    printf("\n========================================================================================\n");
    printf("HASH TABLE BUCKET ARRAY [0 to %d] (Separate Chaining Inspection)\n", inv->table_size - 1);
    printf("========================================================================================\n");

    int occupied = 0;
    int collisions = 0;

    for (int i = 0; i < inv->table_size; i++) {
        printf("Bucket [%2d]: ", i);
        HashBucketNode *curr = inv->buckets[i];
        if (!curr) {
            printf("NULL\n");
        } else {
            occupied++;
            int chain_len = 0;
            while (curr != NULL) {
                chain_len++;
                printf("[%s: Rs.%.2f, Qty:%d] -> ", 
                       curr->sku, curr->list_node->product.price, curr->list_node->product.quantity);
                curr = curr->next;
            }
            printf("NULL\n");
            if (chain_len > 1) collisions += (chain_len - 1);
        }
    }
    printf("----------------------------------------------------------------------------------------\n");
    printf("Capacity (M): %d | Occupied: %d | Total Collisions: %d | Load Factor (alpha): %.2f\n",
           inv->table_size, occupied, collisions, (float)inv->item_count / inv->table_size);
    printf("========================================================================================\n\n");
}

/**
 * Free all allocated memory cleanly
 */
void free_inventory(InventorySystem *inv) {
    if (!inv) return;

    /* Free Doubly Linked List */
    DoublyListNode *curr_list = inv->head;
    while (curr_list != NULL) {
        DoublyListNode *temp = curr_list;
        curr_list = curr_list->next;
        free(temp);
    }

    /* Free Hash Table Buckets */
    for (int i = 0; i < inv->table_size; i++) {
        HashBucketNode *curr_bucket = inv->buckets[i];
        while (curr_bucket != NULL) {
            HashBucketNode *temp = curr_bucket;
            curr_bucket = curr_bucket->next;
            free(temp);
        }
    }
    free(inv->buckets);
    free(inv);
}

/**
 * Main Demo Driver
 */
int main(void) {
    InventorySystem *inv = create_inventory(DEFAULT_TABLE_SIZE);

    printf("============================================================\n");
    printf("  INVENTORY MANAGEMENT SYSTEM (C Language Implementation)\n");
    printf("  Dual Architecture: Hash Table + Doubly Linked List\n");
    printf("  Currency: Indian Rupee (INR - Rs. / Rs)\n");
    printf("============================================================\n\n");

    /* Pre-seed items with Indian Rupee prices */
    Product sample_items[] = {
        {"ELEC-101", "Logitech MX Master 3S Mouse", "Electronics", 8995.0, 24, 8, "Aisle 3, Bin B1"},
        {"ELEC-102", "Dell UltraSharp 27 4K Monitor", "Electronics", 44990.0, 5, 6, "Aisle 2, Pallet P4"},
        {"COMP-201", "Samsung 990 Pro 2TB NVMe SSD", "Components", 15499.0, 42, 10, "Aisle 1, Shelf S3"},
        {"NET-301", "Ubiquiti UniFi Dream Machine", "Networking", 34999.0, 3, 4, "Aisle 4, Rack R2"},
        {"ACC-401", "Anker 100W GaN Fast Charger", "Accessories", 4299.0, 68, 15, "Aisle 1, Bin B4"},
        {"ELEC-103", "Keychron Q1 Mechanical Keyboard", "Electronics", 17499.0, 12, 5, "Aisle 3, Shelf S1"},
        {"COMP-202", "Corsair DDR5 32GB 6000MHz RAM", "Components", 10299.0, 2, 5, "Aisle 1, Shelf S2"}
    };

    int n_samples = sizeof(sample_items) / sizeof(sample_items[0]);
    for (int i = 0; i < n_samples; i++) {
        insert_product(inv, sample_items[i]);
    }

    /* 1. Display initial state */
    display_inventory_sequential(inv);
    display_hash_table_buckets(inv);

    /* 2. Demonstrate O(1) Lookup */
    printf("--- DEMO 1: Search by SKU (O(1) Hash Table Lookup) ---\n");
    DoublyListNode *found = search_product(inv, "ELEC-101");
    if (found) {
        printf("Found: %s | Price: Rs. %.2f | Stock: %d\n\n",
               found->product.name, found->product.price, found->product.quantity);
    }

    /* 3. Demonstrate Stock Adjustment */
    printf("--- DEMO 2: Stock Adjustment (O(1) in-place pointer update) ---\n");
    update_quantity(inv, "COMP-202", +10);

    /* 4. Demonstrate Promotion to Head */
    printf("\n--- DEMO 3: Move to Head of Doubly Linked List (O(1)) ---\n");
    move_to_head(inv, "NET-301");

    /* 5. Demonstrate Deletion */
    printf("\n--- DEMO 4: Delete Product (O(1) unlinking) ---\n");
    delete_product(inv, "ACC-401");

    /* Final Displays */
    display_inventory_sequential(inv);
    display_hash_table_buckets(inv);

    /* Clean memory */
    free_inventory(inv);
    printf("Inventory system memory freed successfully.\n");
    return 0;
}
