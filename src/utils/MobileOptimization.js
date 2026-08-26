// Mobile Optimization - Responsivité complète + performance
// Offline-first, lazy loading, caching, compression

import { useEffect, useState, useRef } from 'react';

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================

export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// ============================================================================
// CACHE MANAGER - Offline Support
// ============================================================================

export class CacheManager {
  constructor(dbName = 'apix-pap-cache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  // Initialiser IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Créer object stores
        const stores = ['paps', 'biens', 'compensations', 'payments', 'notifications'];
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        });
      };
    });
  }

  // Sauvegarder données
  async save(storeName, data) {
    if (!this.db) return;
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put({
        ...data,
        timestamp: Date.now()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Récupérer données
  async get(storeName, key) {
    if (!this.db) return null;
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Récupérer toutes données
  async getAll(storeName) {
    if (!this.db) return [];
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Supprimer données expirées
  async cleanup(storeName, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    if (!this.db) return;
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('timestamp');

    const cutoff = Date.now() - maxAgeMs;

    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.getAll(range);

      request.onsuccess = () => {
        request.result.forEach((item) => {
          store.delete(item.id);
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let cacheManager = null;
export async function getCacheManager() {
  if (!cacheManager) {
    cacheManager = new CacheManager();
    await cacheManager.init();
  }
  return cacheManager;
}

// ============================================================================
// OFFLINE HOOK - Détecte connexion
// ============================================================================

export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================================================
// LAZY LOADING HOOK - Images + Components
// ============================================================================

export function useLazyLoad(ref, callback) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback]);
}

// Lazy Image Component
export function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useLazyLoad(ref, () => {
    if (ref.current) {
      ref.current.src = src;
      ref.current.onload = () => setLoaded(true);
    }
  });

  return (
    <img
      ref={ref}
      alt={alt}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-50'} transition-opacity`}
      src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E`}
    />
  );
}

// ============================================================================
// IMAGE COMPRESSION
// ============================================================================

export async function compressImage(file, maxWidth = 1920, maxHeight = 1440) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculer dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        // Créer canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compresser
        canvas.toBlob(
          (blob) => {
            resolve({
              blob,
              size: blob.size,
              originalSize: file.size,
              ratio: ((blob.size / file.size) * 100).toFixed(1) + '%'
            });
          },
          'image/jpeg',
          0.8
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// ============================================================================
// DEBOUNCE HOOK - Réduit re-renders
// ============================================================================

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// VIRTUAL SCROLL - Pour grandes listes
// ============================================================================

export function useVirtualScroll(items, itemHeight, containerHeight) {
  const [startIndex, setStartIndex] = useState(0);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    setStartIndex(newStartIndex);
  };

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const visibleItems = items.slice(startIndex, startIndex + visibleCount + 1);

  return {
    visibleItems,
    offsetY: startIndex * itemHeight,
    handleScroll,
    totalHeight: items.length * itemHeight
  };
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];

      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.requestStart,
        download: perfData.responseEnd - perfData.responseStart,
        domInteractive: perfData.domInteractive,
        domComplete: perfData.domComplete,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart
      };

      console.log('⚡ Performance Metrics:', metrics);

      // Envoyer à analytics
      if (typeof window.analytics !== 'undefined') {
        window.analytics.track('page_load_metrics', metrics);
      }
    });
  }

  static measureComponent(componentName) {
    const start = performance.now();

    return () => {
      const end = performance.now();
      const duration = end - start;

      if (duration > 1000) {
        console.warn(`⚠️ ${componentName} render took ${duration.toFixed(0)}ms`);
      }

      console.log(`✓ ${componentName}: ${duration.toFixed(0)}ms`);
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  useResponsive,
  useOnline,
  useLazyLoad,
  useDebounce,
  useVirtualScroll,
  CacheManager,
  getCacheManager,
  LazyImage,
  compressImage,
  PerformanceMonitor
};
