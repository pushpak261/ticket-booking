/**
 * Performance Monitoring Utility
 * Track execution times of operations
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Start timing an operation
   * @param {string} label - Operation label
   * @returns {function} End function
   */
  start(label) {
    const startTime = process.hrtime.bigint();
    
    return () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, { count: 0, totalTime: 0, minTime: Infinity, maxTime: 0 });
      }
      
      const metric = this.metrics.get(label);
      metric.count++;
      metric.totalTime += durationMs;
      metric.minTime = Math.min(metric.minTime, durationMs);
      metric.maxTime = Math.max(metric.maxTime, durationMs);
      
      return durationMs;
    };
  }

  /**
   * Get metrics for a label
   */
  getMetrics(label) {
    const metric = this.metrics.get(label);
    if (!metric) return null;
    
    return {
      label,
      calls: metric.count,
      totalMs: metric.totalTime.toFixed(2),
      avgMs: (metric.totalTime / metric.count).toFixed(2),
      minMs: metric.minTime.toFixed(2),
      maxMs: metric.maxTime.toFixed(2)
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const results = [];
    this.metrics.forEach((value, label) => {
      results.push(this.getMetrics(label));
    });
    return results;
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics.clear();
  }
}

module.exports = new PerformanceMonitor();
