/**
 * Performance Optimization Utilities
 * Stratégies de caching, code splitting, lazy loading
 */

/**
 * Memoized fetch avec caching
 */
export class CacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 50;
  }

  set(key, value) {
    // LRU cache - remove oldest if max size reached
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    const stats = {
      size: this.cache.size,
      items: []
    };

    for (const [key, entry] of this.cache) {
      stats.items.push({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      });
    }

    return stats;
  }
}

/**
 * Debounce helper
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle helper
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Batch API calls
 */
export class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 50;
    this.queue = [];
    this.processing = false;
  }

  async add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.process();
      } else if (!this.processing) {
        setTimeout(() => this.process(), this.batchDelay);
      }
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      // Process batch (to be implemented per use case)
      const results = await this.processBatch(batch.map(b => b.item));

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    } finally {
      this.processing = false;

      if (this.queue.length > 0) {
        setTimeout(() => this.process(), this.batchDelay);
      }
    }
  }

  async processBatch(items) {
    // Override in subclass
    return items;
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  constructor(name = 'default') {
    this.name = name;
    this.marks = {};
    this.measures = [];
  }

  mark(label) {
    this.marks[label] = performance.now();
  }

  measure(label, startMark, endMark = 'now') {
    const startTime = this.marks[startMark];
    const endTime = endMark === 'now' ? performance.now() : this.marks[endMark];

    if (startTime === undefined) {
      console.warn(`Start mark '${startMark}' not found`);
      return;
    }

    const duration = endTime - startTime;
    this.measures.push({ label, duration, startTime, endTime });

    return duration;
  }

  getReport() {
    return {
      name: this.name,
      measures: this.measures,
      avgDuration: this.measures.reduce((sum, m) => sum + m.duration, 0) / this.measures.length,
      maxDuration: Math.max(...this.measures.map(m => m.duration)),
      minDuration: Math.min(...this.measures.map(m => m.duration))
    };
  }

  clear() {
    this.marks = {};
    this.measures = [];
  }
}

/**
 * Lazy load components
 */
export const lazyLoadComponent = (importFn, fallback) => {
  return React.lazy(() =>
    importFn().catch(err => {
      console.error('Failed to load component:', err);
      return { default: fallback || () => <div>Failed to load component</div> };
    })
  );
};

/**
 * Image optimization
 */
export const optimizeImage = async (file, options = {}) => {
  const { maxWidth = 1200, maxHeight = 800, quality = 0.8 } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Request deduplication
 */
export class RequestDeduplicator {
  constructor() {
    this.pending = new Map();
  }

  async fetch(key, fetcher) {
    // Return pending request if exists
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    // Create new request
    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

/**
 * Memory leak detection
 */
export const detectMemoryLeaks = (interval = 5000) => {
  if (typeof performance !== 'undefined' && performance.memory) {
    setInterval(() => {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      const usage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

      if (usage > 90) {
        console.warn(`⚠️ High memory usage: ${usage.toFixed(2)}%`);
      }
    }, interval);
  }
};

export default {
  CacheManager,
  debounce,
  throttle,
  BatchProcessor,
  PerformanceMonitor,
  lazyLoadComponent,
  optimizeImage,
  RequestDeduplicator,
  detectMemoryLeaks
};
