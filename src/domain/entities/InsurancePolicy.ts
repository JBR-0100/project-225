import { v4 as uuidv4 } from 'uuid';
import { InsuranceTier } from '../types/enums';

export class InsurancePolicy {
    private policyId: string;
    private tier: InsuranceTier;
    private coverageDescription: string;
    private dailyPremium: number;
    private deductibleAmount: number;
    private maxCoverageAmount: number;

    constructor(
        tier: InsuranceTier,
        dailyPremium: number,
        deductible: number,
        maxCoverage: number
    ) {
        this.policyId = uuidv4();
        this.tier = tier;
        this.coverageDescription = `Coverage plan for ${tier} tier`;
        this.dailyPremium = dailyPremium;
        this.deductibleAmount = deductible;
        this.maxCoverageAmount = maxCoverage;
    }

    getPolicyId(): string { return this.policyId; }
    getTier(): InsuranceTier { return this.tier; }
    getDailyPremium(): number { return this.dailyPremium; }
    getDeductible(): number { return this.deductibleAmount; }
}
