/**
 * Q-Ov1 - Subscription Tier Management & Billing
 * Tracks usage and enforces tier-based quotas
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  monthlyQuota: number; // QPU seconds per month
  features: string[];
  description: string;
  color: string;
}

export interface UserSubscription {
  userId: string;
  tierId: string;
  startDate: string;
  renewalDate: string;
  status: 'active' | 'cancelled' | 'expired';
  autoRenew: boolean;
}

export interface BillingRecord {
  id: string;
  userId: string;
  tierId: string;
  amount: number;
  currency: string;
  period: string; // YYYY-MM
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

/**
 * Subscription management for Q-Ov1
 */
export class SubscriptionManager {
  private tiers: Map<string, SubscriptionTier> = new Map();
  private userSubscriptions: Map<string, UserSubscription> = new Map();

  constructor() {
    this.initializeTiers();
  }

  private initializeTiers(): void {
    const tiers: SubscriptionTier[] = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'GBP',
        monthlyQuota: 300, // 5 minutes
        features: [
          'Local quantum simulator',
          '5 minutes QPU time/month',
          'Access to 8 core models',
          'Community support',
          'Circuit builder'
        ],
        description: 'Perfect for learning and experimentation',
        color: 'slate'
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 25,
        currency: 'GBP',
        monthlyQuota: 6000, // 100 minutes
        features: [
          'Everything in Free',
          '100 minutes QPU time/month',
          'Access to all models',
          'Priority support',
          'Custom models',
          'API access',
          'Usage analytics'
        ],
        description: 'For active developers and startups',
        color: 'blue'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 120,
        currency: 'GBP',
        monthlyQuota: 36000, // 10 hours
        features: [
          'Everything in Pro',
          '10 hours QPU time/month',
          'Dedicated support',
          'Advanced analytics',
          'CI/CD integration',
          'Team collaboration',
          'SLA guarantee',
          'GPU acceleration'
        ],
        description: 'For teams and production workloads',
        color: 'purple'
      },
      {
        id: 'enterprise-plus',
        name: 'Enterprise Plus',
        price: 0, // Custom pricing
        currency: 'GBP',
        monthlyQuota: Infinity,
        features: [
          'Everything in Enterprise',
          'Unlimited QPU time',
          'Custom integrations',
          'Dedicated infrastructure',
          'Direct support line',
          'Training & consulting',
          'Custom contracts',
          'On-premise options'
        ],
        description: 'Custom solution for large organizations',
        color: 'pink'
      }
    ];

    for (const tier of tiers) {
      this.tiers.set(tier.id, tier);
    }
  }

  /**
   * Get all subscription tiers
   */
  getAllTiers(): SubscriptionTier[] {
    return Array.from(this.tiers.values());
  }

  /**
   * Get tier by ID
   */
  getTier(tierId: string): SubscriptionTier | undefined {
    return this.tiers.get(tierId);
  }

  /**
   * Get recommended tier for usage
   */
  getRecommendedTier(monthlyQpuTime: number): string {
    if (monthlyQpuTime < 300) return 'free';
    if (monthlyQpuTime < 6000) return 'pro';
    if (monthlyQpuTime < 36000) return 'enterprise';
    return 'enterprise-plus';
  }

  /**
   * Calculate cost for tier upgrade
   */
  calculateUpgradeCost(currentTier: string, newTier: string, daysRemaining: number): number {\n    const current = this.getTier(currentTier);\n    const target = this.getTier(newTier);\n    if (!current || !target) return 0;\n\n    const daysInMonth = 30;\n    const currentMonthlyCost = current.price;\n    const targetMonthlyPrice = target.price;\n\n    // Prorated upgrade cost\n    const currentProrated = (currentMonthlyCost / daysInMonth) * daysRemaining;\n    const targetCost = targetMonthlyPrice - currentProrated;\n\n    return Math.max(0, targetCost);\n  }\n\n  /**\n   * Estimate monthly cost based on usage\n   */\n  estimateMonthlyCost(tierId: string, qpuTimeUsed: number): number {\n    const tier = this.getTier(tierId);\n    if (!tier || tier.monthlyQuota === Infinity) return 0;\n\n    if (qpuTimeUsed <= tier.monthlyQuota) {\n      return tier.price;\n    }\n\n    // Overage charges: £0.001 per second\n    const overage = qpuTimeUsed - tier.monthlyQuota;\n    return tier.price + overage * 0.001;\n  }\n}\n\n/**\n * Usage-based billing engine\n */\nexport class BillingEngine {\n  private records: Map<string, BillingRecord[]> = new Map();\n\n  /**\n   * Create billing record\n   */\n  createBillingRecord(\n    userId: string,\n    tierId: string,\n    amount: number,\n    currency: string = 'GBP'\n  ): BillingRecord {\n    const record: BillingRecord = {\n      id: `bill-${Date.now()}`,\n      userId,\n      tierId,\n      amount,\n      currency,\n      period: new Date().toISOString().substring(0, 7),\n      status: 'pending',\n      date: new Date().toISOString()\n    };\n\n    if (!this.records.has(userId)) {\n      this.records.set(userId, []);\n    }\n    this.records.get(userId)!.push(record);\n\n    return record;\n  }\n\n  /**\n   * Get user billing history\n   */\n  getUserBillingHistory(userId: string): BillingRecord[] {\n    return (this.records.get(userId) || [])\n      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());\n  }\n\n  /**\n   * Get current month total\n   */\n  getCurrentMonthTotal(userId: string): number {\n    const currentMonth = new Date().toISOString().substring(0, 7);\n    const history = this.getUserBillingHistory(userId);\n    return history\n      .filter(r => r.period === currentMonth && r.status === 'completed')\n      .reduce((sum, r) => sum + r.amount, 0);\n  }\n\n  /**\n   * Mark invoice as paid\n   */\n  markAsPaid(billId: string, userId: string): boolean {\n    const records = this.records.get(userId);\n    if (!records) return false;\n\n    const record = records.find(r => r.id === billId);\n    if (record) {\n      record.status = 'completed';\n      return true;\n    }\n    return false;\n  }\n}\n\n/**\n * Cost analysis and optimization\n */\nexport class CostAnalyzer {\n  /**\n   * Analyze usage patterns\n   */\n  analyzeUsagePattern(\n    jobs: Array<{ qpuTimeUsed: number; timestamp: string }>\n  ): {\n    avgDailyUsage: number;\n    peakUsage: number;\n    recommendedTier: string;\n    potentialSavings: number;\n  } {\n    if (jobs.length === 0) {\n      return {\n        avgDailyUsage: 0,\n        peakUsage: 0,\n        recommendedTier: 'free',\n        potentialSavings: 0\n      };\n    }\n\n    const totalUsage = jobs.reduce((sum, j) => sum + j.qpuTimeUsed, 0);\n    const avgDailyUsage = totalUsage / 30;\n    const peakUsage = Math.max(...jobs.map(j => j.qpuTimeUsed));\n\n    let recommendedTier = 'free';\n    let tierPrice = 0;\n\n    if (avgDailyUsage * 30 < 300) {\n      recommendedTier = 'free';\n      tierPrice = 0;\n    } else if (avgDailyUsage * 30 < 6000) {\n      recommendedTier = 'pro';\n      tierPrice = 25;\n    } else if (avgDailyUsage * 30 < 36000) {\n      recommendedTier = 'enterprise';\n      tierPrice = 120;\n    } else {\n      recommendedTier = 'enterprise-plus';\n      tierPrice = 300; // Estimate\n    }\n\n    // Assume current tier is 'pro' for potential savings calc\n    const currentCost = 25;\n    const potentialSavings = Math.max(0, currentCost - tierPrice);\n\n    return {\n      avgDailyUsage,\n      peakUsage,\n      recommendedTier,\n      potentialSavings\n    };\n  }\n\n  /**\n   * Calculate ROI for tier upgrade\n   */\n  calculateUpgradeROI(\n    currentUsage: number,\n    currentTier: string,\n    newTier: string\n  ): {\n    monthlySavings: number;\n    breakEvenDays: number;\n    recommendation: string;\n  } {\n    const tierPrices: Record<string, number> = {\n      'free': 0,\n      'pro': 25,\n      'enterprise': 120,\n      'enterprise-plus': 300\n    };\n\n    const currentPrice = tierPrices[currentTier] || 0;\n    const newPrice = tierPrices[newTier] || 0;\n    const monthlySavings = Math.max(0, currentPrice - newPrice);\n    const breakEvenDays = monthlySavings > 0 ? (newPrice - currentPrice) / (monthlySavings / 30) : 0;\n\n    let recommendation = 'Downgrade would save money';\n    if (newPrice > currentPrice) {\n      recommendation = `Upgrade costs £${(newPrice - currentPrice).toFixed(2)}/month extra`;\n    } else if (monthlySavings > 0) {\n      recommendation = `Downgrade saves £${monthlySavings.toFixed(2)}/month`;\n    }\n\n    return {\n      monthlySavings,\n      breakEvenDays: Math.max(0, breakEvenDays),\n      recommendation\n    };\n  }\n}\n