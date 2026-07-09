/**
 * Q-Ov1 - Quantum Compute Platform for Startups
 * Core Engine: Local Quantum Simulator & Model Executor
 * 
 * Modeled after Ollama architecture for quantum computing
 * Enables developers to run quantum models locally with one command
 */

export interface QuantumModel {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  qubits: number;
  category: 'entanglement' | 'optimization' | 'ml' | 'cryptography' | 'utility';
  complexity: string;
  estimatedTime: number; // seconds
  downloads: number;
  rating: number;
  tags: string[];
  source: string; // GitHub URL
  previewImage?: string;
}

export interface ExecutionJob {
  id: string;
  modelId: string;
  timestamp: string;
  shots: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  results?: any;
  executionTime: number;
  qpuTimeUsed: number; // in seconds
  tier: 'local' | 'cloud-free' | 'cloud-pro' | 'cloud-enterprise';
  userId?: string;
}

export interface UsageMetrics {
  totalExecutions: number;
  totalQpuTime: number; // seconds
  monthlyQpuTime: number;
  costEstimate: number;
  tier: string;
  quotaRemaining: number;
  quotaTotal: number;
}

/**
 * Q-Ov1 Model Registry - Like Docker Hub but for Quantum Models
 */
export class QOv1ModelRegistry {
  private models: Map<string, QuantumModel> = new Map();
  private localStorage: any;

  constructor() {
    this.initializeDefaultModels();
  }

  private initializeDefaultModels(): void {
    const defaultModels: QuantumModel[] = [
      {
        id: 'bell-state-v1',
        name: 'Bell State Generator',
        version: '1.0.0',
        description: 'Generate maximally entangled 2-qubit Bell states. Perfect for quantum communication protocols.',
        author: 'Quantum-O Team',
        license: 'Apache 2.0',
        qubits: 2,
        category: 'entanglement',
        complexity: 'O(1)',
        estimatedTime: 0.1,
        downloads: 15420,
        rating: 4.8,
        tags: ['entanglement', 'fundamental', 'education'],
        source: 'https://github.com/quantum-o/models/bell-state'
      },
      {
        id: 'grover-search-v1',
        name: 'Grover Search Algorithm',
        version: '1.0.0',
        description: 'Quadratic speedup for unstructured database search. Demonstrates quantum advantage.',
        author: 'Quantum-O Research',
        license: 'Apache 2.0',
        qubits: 3,
        category: 'optimization',
        complexity: 'O(√N)',
        estimatedTime: 0.5,
        downloads: 9832,
        rating: 4.6,
        tags: ['search', 'optimization', 'algorithm'],
        source: 'https://github.com/quantum-o/models/grover-search'
      },
      {
        id: 'vqe-h2-v1',
        name: 'VQE - H2 Molecule',
        version: '1.0.0',
        description: 'Variational Quantum Eigensolver for H2 molecule ground state. Quantum chemistry application.',
        author: 'Quantum-O ML Team',
        license: 'Apache 2.0',
        qubits: 2,
        category: 'ml',
        complexity: 'O(n²)',
        estimatedTime: 2.0,
        downloads: 6745,
        rating: 4.7,
        tags: ['chemistry', 'ml', 'variational'],
        source: 'https://github.com/quantum-o/models/vqe-h2'
      },
      {
        id: 'qrng-8bit-v1',
        name: 'Quantum Random Number Gen (8-bit)',
        version: '1.0.0',
        description: 'Cryptographically secure random number generation using quantum mechanics.',
        author: 'Quantum-O Security',
        license: 'Apache 2.0',
        qubits: 8,
        category: 'utility',
        complexity: 'O(n)',
        estimatedTime: 0.2,
        downloads: 12103,
        rating: 4.9,
        tags: ['random', 'crypto', 'utility'],
        source: 'https://github.com/quantum-o/models/qrng'
      },
      {
        id: 'shor-factorization-v1',
        name: "Shor's Algorithm",
        version: '1.0.0',
        description: 'Exponential speedup for integer factorization. Demonstrates quantum computing threat to RSA.',
        author: 'Quantum-O Security',
        license: 'Apache 2.0',
        qubits: 5,
        category: 'cryptography',
        complexity: 'O(n³)',
        estimatedTime: 1.5,
        downloads: 7654,
        rating: 4.5,
        tags: ['factorization', 'cryptography', 'advanced'],
        source: 'https://github.com/quantum-o/models/shor'
      },
      {
        id: 'qaoa-maxcut-v1',
        name: 'QAOA - MaxCut Problem',
        version: '1.0.0',
        description: 'Quantum Approximate Optimization Algorithm for the MaxCut problem.',
        author: 'Quantum-O Optimization',
        license: 'Apache 2.0',
        qubits: 4,
        category: 'optimization',
        complexity: 'O(n²p)',
        estimatedTime: 1.2,
        downloads: 5432,
        rating: 4.4,
        tags: ['optimization', 'qaoa', 'graph'],
        source: 'https://github.com/quantum-o/models/qaoa-maxcut'
      },
      {
        id: 'ghz-state-v1',
        name: 'GHZ State Generator',
        version: '1.0.0',
        description: 'Generate N-qubit GHZ (Greenberger-Horne-Zeilinger) entangled states.',
        author: 'Quantum-O Team',
        license: 'Apache 2.0',
        qubits: 3,
        category: 'entanglement',
        complexity: 'O(n)',
        estimatedTime: 0.15,
        downloads: 11289,
        rating: 4.7,
        tags: ['entanglement', 'multi-qubit', 'education'],
        source: 'https://github.com/quantum-o/models/ghz-state'
      },
      {
        id: 'qft-v1',
        name: 'Quantum Fourier Transform',
        version: '1.0.0',
        description: 'Core quantum algorithm for phase estimation and period finding. Foundation for Shor.',
        author: 'Quantum-O Algorithms',
        license: 'Apache 2.0',
        qubits: 3,
        category: 'utility',
        complexity: 'O(n²)',
        estimatedTime: 0.3,
        downloads: 8901,
        rating: 4.6,
        tags: ['fourier', 'phase-estimation', 'fundamental'],
        source: 'https://github.com/quantum-o/models/qft'
      }
    ];

    for (const model of defaultModels) {
      this.models.set(model.id, model);
    }
  }

  /**
   * Get all available models
   */
  listModels(category?: string): QuantumModel[] {
    const all = Array.from(this.models.values());
    if (category) {
      return all.filter(m => m.category === category);
    }
    return all.sort((a, b) => b.downloads - a.downloads);
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): QuantumModel | undefined {
    return this.models.get(modelId);
  }

  /**
   * Search models
   */
  searchModels(query: string): QuantumModel[] {
    const q = query.toLowerCase();
    return Array.from(this.models.values()).filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  /**
   * Get trending models (by downloads)
   */
  getTrendingModels(limit: number = 6): QuantumModel[] {
    return Array.from(this.models.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  /**
   * Get top-rated models
   */
  getTopRated(limit: number = 6): QuantumModel[] {
    return Array.from(this.models.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Add custom model (for users)
   */
  addCustomModel(model: QuantumModel): void {
    this.models.set(model.id, model);
    this.persistModels();
  }

  private persistModels(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const customModels = Array.from(this.models.values()).filter(
        m => m.source.includes('user-') || m.source.includes('custom-')
      );
      localStorage.setItem('qov1_custom_models', JSON.stringify(customModels));
    }
  }
}

/**
 * Q-Ov1 Usage Tracker - Monitors QPU time and costs
 */
export class UsageTracker {
  private metrics: UsageMetrics;

  constructor(tier: string = 'free') {
    this.metrics = {
      totalExecutions: 0,
      totalQpuTime: 0,
      monthlyQpuTime: 0,
      costEstimate: 0,
      tier,
      quotaRemaining: this.getQuotaForTier(tier),
      quotaTotal: this.getQuotaForTier(tier)
    };
    this.loadFromStorage();
  }

  private getQuotaForTier(tier: string): number {
    const quotas: Record<string, number> = {
      'free': 300, // 5 minutes free per month
      'pro': 6000, // 100 minutes
      'enterprise': Infinity, // unlimited
      'enterprise-plus': Infinity
    };
    return quotas[tier] || 300;
  }

  /**
   * Track a quantum execution
   */
  trackExecution(qpuTimeUsed: number): void {
    this.metrics.totalExecutions++;
    this.metrics.totalQpuTime += qpuTimeUsed;
    this.metrics.monthlyQpuTime += qpuTimeUsed;
    this.metrics.quotaRemaining = Math.max(0, this.metrics.quotaRemaining - qpuTimeUsed);
    this.updateCostEstimate();
    this.saveToStorage();
  }

  private updateCostEstimate(): void {
    const costPerSecond: Record<string, number> = {
      'free': 0,
      'pro': 0.001, // £0.001 per second
      'enterprise': 0.0005,
      'enterprise-plus': 0.0003
    };
    const rate = costPerSecond[this.metrics.tier] || 0;
    this.metrics.costEstimate = this.metrics.monthlyQpuTime * rate;
  }

  /**
   * Get current metrics
   */
  getMetrics(): UsageMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if user has quota remaining
   */
  hasQuota(): boolean {
    return this.metrics.quotaRemaining > 0;
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(): number {
    if (this.metrics.quotaTotal === Infinity) return 0;
    return (
      ((this.metrics.quotaTotal - this.metrics.quotaRemaining) / this.metrics.quotaTotal) * 100
    );
  }

  /**
   * Reset monthly quota
   */
  resetMonthlyQuota(): void {
    const newQuota = this.getQuotaForTier(this.metrics.tier);
    this.metrics.monthlyQpuTime = 0;
    this.metrics.quotaRemaining = newQuota;
    this.metrics.costEstimate = 0;
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('qov1_metrics', JSON.stringify(this.metrics));
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('qov1_metrics');
      if (stored) {
        const saved = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...saved };
      }
    }
  }
}

/**
 * Q-Ov1 Job Manager - Track execution history
 */
export class JobManager {
  private jobs: Map<string, ExecutionJob> = new Map();

  /**
   * Create new job
   */
  createJob(modelId: string, shots: number, tier: string, userId?: string): ExecutionJob {
    const job: ExecutionJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      timestamp: new Date().toISOString(),
      shots,
      status: 'queued',
      executionTime: 0,
      qpuTimeUsed: 0,
      tier,
      userId
    };
    this.jobs.set(job.id, job);
    this.persistJobs();
    return job;
  }

  /**
   * Update job status
   */
  updateJob(jobId: string, updates: Partial<ExecutionJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates);
      this.persistJobs();
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ExecutionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs for user
   */
  getUserJobs(userId: string): ExecutionJob[] {
    return Array.from(this.jobs.values())
      .filter(j => j.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get recent jobs
   */
  getRecentJobs(limit: number = 10): ExecutionJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get job stats
   */
  getStats(): {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalQpuTime: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      totalJobs: jobs.length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      totalQpuTime: jobs.reduce((sum, j) => sum + j.qpuTimeUsed, 0)
    };
  }

  private persistJobs(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const jobsArray = Array.from(this.jobs.values());
      localStorage.setItem('qov1_jobs', JSON.stringify(jobsArray.slice(-50))); // Keep last 50
    }
  }

  private loadJobs(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('qov1_jobs');
      if (stored) {
        const jobs = JSON.parse(stored) as ExecutionJob[];
        jobs.forEach(job => this.jobs.set(job.id, job));
      }
    }
  }
}
