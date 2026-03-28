## 1. Object-Oriented Programming Basics

### 1. What is Object-Oriented Programming?

Object-Oriented Programming (OOP) is a programming paradigm with four main characteristics:

- **Encapsulation** — Bundling data and methods that operate on that data within a class
- **Inheritance** — Derived classes inherit properties and methods from parent classes
- **Polymorphism** — Same interface with different implementations
- **Abstraction** — Simplifying complex problems

### 2. Difference between struct and class?

| Feature | struct | class |
|---------|--------|-------|
| Default access control | public | private |
| Default inheritance | public | private |
| Use case | Data structures | Object-oriented |

### 3. How polymorphism works internally

Polymorphism is primarily implemented through virtual function tables (vtable). Each class with virtual functions has a vtable, and when a derived class overrides a virtual function, it replaces the function pointer in the table.

## 2. Memory Management

### 1. Difference between heap and stack?

- **Stack**: Automatically allocated and deallocated, limited size, suitable for local variables
- **Heap**: Manually allocated and deallocated, size limited by physical memory, watch out for memory leaks

### 2. What is a memory leak? How to avoid it?

A memory leak occurs when a program fails to release memory that is no longer used.

**Prevention methods**:
- Use smart pointers (`std::unique_ptr`, `std::shared_ptr`)
- Follow the RAII principle
- Release resources promptly

### 3. Types of smart pointers?

```cpp
std::unique_ptr<T>    // Exclusive ownership
std::shared_ptr<T>    // Shared ownership
std::weak_ptr<T>      // Weak reference, solves circular references
```

## 3. STL Containers

### 1. Difference between vector and list?

| Feature | vector | list |
|---------|--------|------|
| Underlying structure | Dynamic array | Doubly linked list |
| Random access | O(1) | O(n) |
| Insert/Delete | O(1) at end, O(n) elsewhere | O(1) |
| Memory | Compact | Extra pointer per node |

### 2. Difference between unordered_map and map?

- `std::map`: Based on red-black tree, sorted, O(log n) lookup
- `std::unordered_map`: Based on hash table, unsorted, O(1) average lookup

### 3. When do iterators become invalid?

- `vector`: Current iterator may be invalidated after insert/delete
- `list`: Iterator pointing to a deleted node becomes invalid
- `map/unordered_map`: Insert does not invalidate iterators

## 4. Algorithm Related

### 1. Common sorting algorithm complexity

| Algorithm | Average | Worst | Best |
|-----------|---------|-------|------|
| Quick Sort | O(n log n) | O(n²) | O(n log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) |

### 2. Properties of Red-Black Tree

- Each node is either red or black
- Root node is black
- Leaf nodes (NIL) are black
- Red node's children must be black
- Black height is the same for all paths from any node to its leaves

## 5. Other Common Interview Topics

### 1. Difference between const and constexpr

- `const`: Cannot be modified at both compile time and runtime
- `constexpr`: Evaluated at compile time

### 2. What does the static keyword do?

- For variables: Changes scope, extends lifetime
- For functions: Internal linkage, accessible only within the file

### 3. Copy constructor vs Move constructor

- Copy constructor: Copies resources
- Move constructor: Transfers resource ownership, more efficient

## Interview Tips

1. **Understand the原理** — Don't just memorize answers, understand the underlying principles
2. **Combine with practice** — Be able to give real-world usage examples
3. **Use diagrams** — For complex structures like graphs and trees, drawing is clearer
