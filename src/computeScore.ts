import { scoreInfo } from "./types";

const weighMetric = (metric: number, max: number, weight: number) => {
    const scaled = (metric / max) * 100
    return Math.round(scaled) * weight
}

export async function computeScoreFC(info: scoreInfo) {
    const lendingHealthScore = computeLendingHealthScore(info.lending_health);
    const transactionNumberScore = computeTransactionNumberScore(info.trans_number);
    const arbitrumSnapshotScore = await computeArbitrumSnapshotScore(info.voting_participation);
    const interactedContractsScore = computeInteractedContractsScore(info.contract_interactions);
    const assetAmountScore = computeAssetAmountScore(info.asset_amount);
    const timeInPlatformScore = computeTimeInPlatformScore(info.user_time);

    console.log({
        lendingHealthScore,
        transactionNumberScore,
        arbitrumSnapshotScore,
        interactedContractsScore,
        assetAmountScore,
        timeInPlatformScore
    })

    let totalScore = 0;
    totalScore += weighMetric(lendingHealthScore, 90, 0.1)
    totalScore += weighMetric(transactionNumberScore, 90, 0.15)
    totalScore += weighMetric(arbitrumSnapshotScore, 90, 0.2)
    totalScore += weighMetric(interactedContractsScore, 85, 0.2)
    totalScore += weighMetric(assetAmountScore, 90, 0.2)
    totalScore += weighMetric(timeInPlatformScore, 90, 0.15)

    return totalScore.toFixed(1);
    
}

export function computeLendingHealthScore(amount: number) {
    if (amount == null) {
        return 50;
    }
    if (amount < 1) {
        return 20;
    }
    if (amount < 1.1) {
        return 60;
    }
    if (amount < 1.3) {
        return 80;
    }
    return 90;
}

export function computeTransactionNumberScore(amount: number) {
    if (amount < 30) {
        return 0;
    }
    if (amount < 50) {
        return 20;
    }
    if (amount < 100) {
        return 40;
    }
    if (amount < 150) {
        return 60;
    }
    if (amount < 200) {
        return 80;
    }
    return 90;
}

export async function computeArbitrumSnapshotScore(percentage: number) {
    
    if (percentage < 20) {
        return 0;
    }
    if (percentage < 30) {
        return 40;
    }
    if (percentage < 50) {
        return 60;
    }
    if (percentage < 70) {
        return 75;
    }
    return 90;
}

export function computeInteractedContractsScore(amount: number) {
    if (amount < 3) {
        return 0;
    }
    if (amount < 7) {
        return 20;
    }
    if (amount < 15) {
        return 35;
    }
    if (amount < 25) {
        return 50;
    }
    if (amount < 50) {
        return 70;
    }
    return 85;
}

export function computeAssetAmountScore(amount: number) {
    if (amount < 1) {
        return 0;
    }
    if (amount < 500) {
        return 15;
    }
    if (amount < 1500) {
        return 30;
    }
    if (amount < 3000) {
        return 40;
    }
    if (amount < 6000) {
        return 55;
    }
    if (amount < 10000) {
        return 70;
    }
    if (amount < 25000) {
        return 75;
    }
    if (amount < 50000) {
        return 85;
    }
    return 90;
}

export function computeTimeInPlatformScore(days: number) {
    if (!days) {
        return 0;
    }
    if (days < 30) {
        return 20;
    }
    if (days < 60) {
        return 40;
    }
    if (days < 90) {
        return 60;
    }
    if (days < 120) {
        return 80;
    }
    return 90;
}