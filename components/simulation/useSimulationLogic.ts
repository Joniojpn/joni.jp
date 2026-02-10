
import { useState, useMemo } from 'react';

// --- Types & Interfaces ---

export interface ResidentState {
    class1: number;
    class2: number;
    class3: number;
    class4: number;
    class5: number;
    class6: number;
}

export type StaffingRatioType = 'Ratio_I' | 'Ratio_II' | 'None'; // I=4:1(12:1), II=5:1(30:1), None=Base only
export type ProfessionalStaffType = 'I' | 'II' | 'None';

export interface SimulationConfig {
    regionalUnitPrice: number; // e.g., 10.00
    operatingDays: number; // 28-31, default 30
    nightStaffCount: number; // 1-4, Default 2
    prevAvgUsers: number; // Calculation Basis for Staffing Ratio
    professionalStaffType: ProfessionalStaffType;
    treatmentImprovementRates: {
        treatment: number; // 処遇改善加算 (%)
        special: number;   // 特定処遇改善加算 (%)
        baseUp: number;    // ベースアップ等支援加算 (%)
    };
    residents: ResidentState;
    additionalPartTimeHours: number; // Hours/week
    hourlyRate: number; // Cost: Hourly Request
    socialInsuranceRate: number; // Cost: Social Insurance %
}

export interface CalculationItem {
    id: string;
    label: string;
    unitPrice: number | string;
    count: number | string;
    days: number | string;
    formula: string;
    subtotal: number;
    category: 'Revenue' | 'Cost' | 'Profit';
    isTotal?: boolean;
}

export interface SimulationResult {
    totalResidents: number;
    totalFTE: number;
    calculatedRatioType: StaffingRatioType; // Actual calculation used
    nextTierHours: number | null; // Hours needed for next tier, null if max
    monthlyRevenue: number;
    monthlyPersonnelCost: number;
    monthlyProfit: number;
    breakdownRows: CalculationItem[];
    nightSupportInfo: { label: string; unit: string }; // For UI hint (Unit is variable now)
}

// --- Constants (FY2024 / R6 Revision) ---

// Base Reward (Service Fee I - 6:1 equivalent)
const BASE_UNITS_R6 = {
    class6: 600, class5: 456, class4: 372, class3: 297, class2: 188, class1: 171
};

// Personnel Placement Addition (I & II)
const STAFFING_ADDITIONS_R6 = {
    // Type I (12:1 / approx 4:1 total)
    'Ratio_I': {
        high: 83, // Class 4, 5, 6
        low: 77   // Class 1, 2, 3
    },
    // Type II (30:1 / approx 5:1 total)
    'Ratio_II': {
        high: 33,
        low: 31
    },
    'None': { high: 0, low: 0 }
};

// Night Support Matrix (Type I)
// Key: Total Users -> Value: { level4 (High), level3 (Mid), level2 (Low) }
// Mapping Assumption: 
//   Level 4 (High): Class 6, 5, 4
//   Level 3 (Mid):  Class 3
//   Level 2 (Low):  Class 2, 1
const NIGHT_SUPPORT_MATRIX: Record<number, { level4: number, level3: number, level2: number }> = {
    // <= 7 (Using 7's value for 1-7)
    1: { level4: 672, level3: 560, level2: 448 },
    2: { level4: 672, level3: 560, level2: 448 },
    3: { level4: 448, level3: 373, level2: 299 },
    4: { level4: 336, level3: 280, level2: 224 },
    5: { level4: 269, level3: 224, level2: 179 },
    6: { level4: 224, level3: 187, level2: 149 },
    7: { level4: 192, level3: 160, level2: 128 },
    // 8-20 range (Interpolated/Specifics)
    8: { level4: 168, level3: 140, level2: 112 },
    9: { level4: 149, level3: 124, level2: 99 }, // Extrapolated
    10: { level4: 135, level3: 113, level2: 90 }, // Extrapolated
    11: { level4: 122, level3: 102, level2: 81 }, // Extrapolated
    12: { level4: 112, level3: 93, level2: 75 }, // Extrapolated
    13: { level4: 103, level3: 86, level2: 69 },  // Extrapolated
    14: { level4: 96, level3: 80, level2: 64 },   // Extrapolated
    15: { level4: 90, level3: 75, level2: 60 },   // Provided
    16: { level4: 84, level3: 70, level2: 56 },   // Provided (User specified)
    17: { level4: 79, level3: 66, level2: 53 },   // Provided
    18: { level4: 75, level3: 63, level2: 50 },   // Extrapolated
    19: { level4: 71, level3: 59, level2: 47 },   // Extrapolated
    20: { level4: 67, level3: 56, level2: 45 },   // Provided
    // >= 21 (Using 30's val or extrapolated)
    21: { level4: 64, level3: 53, level2: 43 },
    22: { level4: 61, level3: 51, level2: 41 },
    23: { level4: 58, level3: 48, level2: 39 },
    24: { level4: 56, level3: 47, level2: 37 },
    25: { level4: 54, level3: 45, level2: 36 },
    26: { level4: 51, level3: 43, level2: 34 },
    27: { level4: 50, level3: 42, level2: 33 },
    28: { level4: 48, level3: 40, level2: 32 },
    29: { level4: 46, level3: 38, level2: 31 },
    30: { level4: 45, level3: 38, level2: 30 }, // Provided (Hypothetical)
};

const PROFESSIONAL_DAILY = {
    'I': 10,
    'II': 5,
    'None': 0,
};

const FIXED_STAFF_FTE = 2.0;
const FIXED_PERSONNEL_COST = 600000;

// --- Hook ---

export const useSimulationLogic = () => {
    const [config, setConfig] = useState<SimulationConfig>({
        regionalUnitPrice: 10.00,
        operatingDays: 30,
        nightStaffCount: 2,
        prevAvgUsers: 10,
        professionalStaffType: 'None',
        treatmentImprovementRates: {
            treatment: 18.6,
            special: 2.5,
            baseUp: 2.0,
        },
        residents: { class1: 0, class2: 9, class3: 4, class4: 3, class5: 0, class6: 0 },
        additionalPartTimeHours: 0,
        hourlyRate: 1200,
        socialInsuranceRate: 15.0,
    });

    const setResident = (cls: keyof ResidentState, val: number) =>
        setConfig(prev => ({ ...prev, residents: { ...prev.residents, [cls]: Math.max(0, val) } }));

    const setConfigField = <K extends keyof SimulationConfig>(field: K, val: SimulationConfig[K]) =>
        setConfig(prev => ({ ...prev, [field]: val }));

    const results: SimulationResult = useMemo(() => {
        const rows: CalculationItem[] = [];
        const { residents, additionalPartTimeHours, regionalUnitPrice, operatingDays, nightStaffCount, prevAvgUsers } = config;

        // 1. Basic Stats
        const totalResidents = Object.values(residents).reduce((a, b) => a + b, 0);
        const totalFTE = FIXED_STAFF_FTE + (additionalPartTimeHours / 40);

        // 2. Staffing Ratio Determination (New 12:1 / 30:1 Logic)
        let calculatedRatioType: StaffingRatioType = 'None';
        let nextTierHours: number | null = null;

        // Thresholds based on Prompt
        const threshold_I = prevAvgUsers / 12; // 12:1
        const threshold_II = prevAvgUsers / 30; // 30:1 (as requested)

        // Logic (Always Auto)
        if (totalFTE >= threshold_I) {
            calculatedRatioType = 'Ratio_I';
            nextTierHours = null; // Max tier
        } else if (totalFTE >= threshold_II) {
            calculatedRatioType = 'Ratio_II';
            // Hours needed for Tier I
            nextTierHours = Math.max(0, (threshold_I - totalFTE) * 40);
        } else {
            calculatedRatioType = 'None';
            // Hours needed for Tier II
            nextTierHours = Math.max(0, (threshold_II - totalFTE) * 40);
        }

        // 3. Determine Night Support Unit (Matrix Logic)
        // Night Staff count effectively divides the unit size
        const effectiveUnitSize = Math.ceil(totalResidents / nightStaffCount);

        // Find row in matrix. Clamp to defined keys if necessary (1-30 are defined).
        const nightRow = NIGHT_SUPPORT_MATRIX[Math.max(1, Math.min(30, effectiveUnitSize))] || NIGHT_SUPPORT_MATRIX[30];

        // 4. Calculate Revenue Rows
        let monthlyRevenue = 0; // Running total in Yen
        let totalMonthlyUnits = 0; // Running total in Units (for Treatment Addition base)

        // --- Base Reward ---
        const BASE_KEYS = ['class6', 'class5', 'class4', 'class3', 'class2', 'class1'] as const;
        BASE_KEYS.forEach(key => {
            const count = residents[key];
            if (count > 0) {
                const unit = BASE_UNITS_R6[key];
                const units = unit * operatingDays * count;
                totalMonthlyUnits += units;

                const subtotal = Math.floor(units * regionalUnitPrice);
                monthlyRevenue += subtotal;

                const labelCls = key.replace('class', '区分');
                rows.push({
                    id: `revenue-base-${key}`,
                    category: 'Revenue',
                    label: `基本報酬(I) [${labelCls}]`,
                    formula: `${unit}単位 x ${operatingDays}日 x ${count}人`,
                    unitPrice: unit,
                    days: operatingDays,
                    count: count,
                    subtotal
                });
            }
        });

        // --- Staffing Addition (New Split Logic) ---
        if (calculatedRatioType !== 'None') {
            const countC1 = residents.class6 + residents.class5 + residents.class4; // Severe
            const countC2 = residents.class3 + residents.class2 + residents.class1; // Mild

            let unitC1 = 0;
            let unitC2 = 0;
            let labelBase = '';

            if (calculatedRatioType === 'Ratio_I') {
                // Type I (12:1)
                unitC1 = STAFFING_ADDITIONS_R6.Ratio_I.high;
                unitC2 = STAFFING_ADDITIONS_R6.Ratio_I.low;
                labelBase = '人員配置体制加算(I)';
            } else {
                // Type II (30:1)
                unitC1 = STAFFING_ADDITIONS_R6.Ratio_II.high;
                unitC2 = STAFFING_ADDITIONS_R6.Ratio_II.low;
                labelBase = '人員配置体制加算(II)';
            }

            // Row for C1 (Severe)
            if (countC1 > 0) {
                const units = unitC1 * operatingDays * countC1;
                totalMonthlyUnits += units;

                const sub = Math.floor(units * regionalUnitPrice);
                monthlyRevenue += sub;

                rows.push({
                    id: 'revenue-staff-c1',
                    category: 'Revenue',
                    label: `${labelBase} [区分4以上]`,
                    formula: `${unitC1}単位 x ${operatingDays}日 x ${countC1}人`,
                    unitPrice: unitC1,
                    days: operatingDays,
                    count: countC1,
                    subtotal: sub
                });
            }

            // Row for C2 (Mild)
            if (countC2 > 0) {
                const units = unitC2 * operatingDays * countC2;
                totalMonthlyUnits += units;

                const sub = Math.floor(units * regionalUnitPrice);
                monthlyRevenue += sub;

                rows.push({
                    id: 'revenue-staff-c2',
                    category: 'Revenue',
                    label: `${labelBase} [区分3以下]`,
                    formula: `${unitC2}単位 x ${operatingDays}日 x ${countC2}人`,
                    unitPrice: unitC2,
                    days: operatingDays,
                    count: countC2,
                    subtotal: sub
                });
            }
        }

        // 5. Night Support & Professional Staff
        const profUnit = PROFESSIONAL_DAILY[config.professionalStaffType];

        (Object.keys(residents) as Array<keyof ResidentState>).forEach(cls => {
            const count = residents[cls];
            if (count === 0) return;

            const labelCls = cls.replace('class', '区分');

            // C. Night Support (Matrix I)
            let nightUnit = 0;
            let levelLabel = '';

            if (['class6', 'class5', 'class4'].includes(cls)) {
                nightUnit = nightRow.level4;
                levelLabel = '(L4)';
            } else if (cls === 'class3') {
                nightUnit = nightRow.level3;
                levelLabel = '(L3)';
            } else {
                nightUnit = nightRow.level2;
                levelLabel = '(L2)';
            }

            if (nightUnit > 0) {
                const nightLineUnits = nightUnit * operatingDays * count;
                totalMonthlyUnits += nightLineUnits;

                const nightSubtotal = Math.floor(nightLineUnits * regionalUnitPrice);
                monthlyRevenue += nightSubtotal;

                rows.push({
                    id: `revenue-night-${cls}`,
                    label: `[${labelCls}] 夜間支援加算(I) ${levelLabel}`,
                    unitPrice: nightUnit,
                    days: operatingDays,
                    count: count,
                    formula: `${nightUnit}単位 x ${operatingDays}日 x ${count}人`,
                    subtotal: nightSubtotal,
                    category: 'Revenue',
                });
            }

            // D. Prof
            if (profUnit > 0) {
                const profLineUnits = profUnit * operatingDays * count;
                totalMonthlyUnits += profLineUnits;

                const profSubtotal = Math.floor(profLineUnits * regionalUnitPrice);
                monthlyRevenue += profSubtotal;

                rows.push({
                    id: `revenue-prof-${cls}`,
                    label: `[${labelCls}] 福祉専門職員配置等加算 (${config.professionalStaffType})`,
                    unitPrice: profUnit,
                    days: operatingDays,
                    count: count,
                    formula: `${profUnit}単位 x ${operatingDays}日 x ${count}人`,
                    subtotal: profSubtotal,
                    category: 'Revenue',
                });
            }
        });

        // Treatment Imp
        const { treatment, special, baseUp } = config.treatmentImprovementRates;
        const totalRate = treatment + special + baseUp;

        // Base separate calculation for Treatment (usually calculated on total units * regional price)
        const baseRewardYenForTreatment = Math.floor(totalMonthlyUnits * regionalUnitPrice);
        let treatmentAmount = 0;

        if (totalRate > 0) {
            treatmentAmount = Math.floor(baseRewardYenForTreatment * (totalRate / 100));
            monthlyRevenue += treatmentAmount; // Add to final total

            rows.push({
                id: 'add-treatment',
                label: `処遇改善加算等 (計${totalRate}%)`,
                unitPrice: '-',
                days: '-',
                count: '-',
                formula: `${totalMonthlyUnits.toLocaleString()}単位 (${baseRewardYenForTreatment.toLocaleString()}円) x ${totalRate}%`,
                subtotal: treatmentAmount,
                category: 'Revenue',
            });
        }

        // Cost
        let costSubtotal = 0;
        costSubtotal += FIXED_PERSONNEL_COST;
        rows.push({
            id: 'cost-fixed',
            label: '固定人件費',
            unitPrice: '-',
            days: '-',
            count: '-',
            formula: '固定値',
            subtotal: FIXED_PERSONNEL_COST,
            category: 'Cost',
        });

        const monthlyHours = additionalPartTimeHours * 4.3;
        const hourlyTotalCost = config.hourlyRate * (1 + config.socialInsuranceRate / 100);
        const variableCost = Math.floor(monthlyHours * hourlyTotalCost);
        costSubtotal += variableCost;

        rows.push({
            id: 'cost-variable',
            label: '追加パート人件費',
            unitPrice: config.hourlyRate,
            days: '-',
            count: `${monthlyHours.toFixed(1)}h`,
            formula: `${monthlyHours.toFixed(1)}h x ${config.hourlyRate}円 x ...`,
            subtotal: variableCost,
            category: 'Cost',
        });

        const monthlyPersonnelCost = costSubtotal;

        return {
            totalResidents,
            totalFTE,
            calculatedRatioType, // Actual used for calc
            nextTierHours,
            monthlyRevenue,
            monthlyPersonnelCost,
            monthlyProfit: monthlyRevenue - monthlyPersonnelCost,
            breakdownRows: rows,
            nightSupportInfo: {
                label: `夜勤${nightStaffCount}名 (規模${effectiveUnitSize}名)`,
                unit: '表参照'
            }
        };

    }, [config]);

    return { config, setConfigField, setResident, results };
};
