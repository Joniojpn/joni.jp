
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

export type StaffingRatioType = '4:1' | '5:1' | 'Other';
// Revised Night Support Types
export type NightShiftType = 'staff' | 'sleep_in' | 'on_call' | 'none'; // I, II, III, None
export type ProfessionalStaffType = 'I' | 'II' | 'None';

export interface SimulationConfig {
    regionalUnitPrice: number; // e.g., 10.00
    operatingDays: number; // 28-31, default 30
    nightShiftType: NightShiftType; // Revised
    professionalStaffType: ProfessionalStaffType;
    treatmentImprovementRates: {
        treatment: number; // 処遇改善加算 (%)
        special: number;   // 特定処遇改善加算 (%)
        baseUp: number;    // ベースアップ等支援加算 (%)
    };
    residents: ResidentState;
    additionalPartTimeHours: number; // Hours/week
    staffingRatioOverride: StaffingRatioType | 'Auto';
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
    staffingRatioType: StaffingRatioType;
    monthlyRevenue: number;
    monthlyPersonnelCost: number;
    monthlyProfit: number;
    breakdownRows: CalculationItem[];
    nightSupportInfo: { label: string; unit: number }; // For UI hint
}

// --- Constants ---

const BASE_UNITS_STANDARD = {
    class6: 367, class5: 300, class4: 267, class3: 233, class2: 200, class1: 167
};

const STAFFING_ADDITIONS = {
    '4:1': { class6: 153, class5: 150, class4: 128, class3: 127, class2: 125, class1: 133 },
    '5:1': { class6: 100, class5: 100, class4: 83, class3: 84, class2: 83, class1: 93 },
    'Other': { class6: 0, class5: 0, class4: 0, class3: 0, class2: 0, class1: 0 }
};

// R6 Revised Night Support Rates
// Structure: Type -> Capacity Range -> Unit
const NIGHT_SUPPORT_RATES = {
    'staff': { // Type I (常駐)
        small: 666,  // <= 7
        medium: 281, // 8-20
        large: 163   // >= 21
    },
    'sleep_in': { // Type II (宿直)
        small: 380,
        medium: 161,
        large: 93
    },
    'on_call': { // Type III (体制III)
        fixed: 10
    }
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
        nightShiftType: 'staff', // Default I
        professionalStaffType: 'None',
        treatmentImprovementRates: {
            treatment: 18.6,
            special: 2.5,
            baseUp: 2.0,
        },
        residents: { class1: 0, class2: 9, class3: 4, class4: 3, class5: 0, class6: 0 },
        additionalPartTimeHours: 0,
        staffingRatioOverride: 'Auto',
        hourlyRate: 1200,
        socialInsuranceRate: 15.0,
    });

    const setResident = (cls: keyof ResidentState, val: number) =>
        setConfig(prev => ({ ...prev, residents: { ...prev.residents, [cls]: Math.max(0, val) } }));

    const setConfigField = <K extends keyof SimulationConfig>(field: K, val: SimulationConfig[K]) =>
        setConfig(prev => ({ ...prev, [field]: val }));

    const results: SimulationResult = useMemo(() => {
        const rows: CalculationItem[] = [];
        const { residents, additionalPartTimeHours, regionalUnitPrice, staffingRatioOverride, operatingDays, nightShiftType } = config;

        // 1. Basic Stats
        const totalResidents = Object.values(residents).reduce((a, b) => a + b, 0);
        const totalFTE = FIXED_STAFF_FTE + (additionalPartTimeHours / 40);

        // 2. Staffing Ratio
        let ratioType: StaffingRatioType = 'Other';
        if (staffingRatioOverride !== 'Auto') {
            ratioType = staffingRatioOverride;
        } else if (totalFTE > 0) {
            const rawRatio = totalResidents / totalFTE;
            if (rawRatio <= 4.0) ratioType = '4:1';
            else if (rawRatio <= 5.0) ratioType = '5:1';
        }

        // 3. Determine Night Support Unit
        let nightUnit = 0;
        let nightLabel = 'なし';

        if (nightShiftType === 'staff') {
            if (totalResidents <= 7) { nightUnit = NIGHT_SUPPORT_RATES.staff.small; nightLabel = '体制I (小規模)'; }
            else if (totalResidents <= 20) { nightUnit = NIGHT_SUPPORT_RATES.staff.medium; nightLabel = '体制I (中規模)'; }
            else { nightUnit = NIGHT_SUPPORT_RATES.staff.large; nightLabel = '体制I (大規模)'; }
        } else if (nightShiftType === 'sleep_in') {
            if (totalResidents <= 7) { nightUnit = NIGHT_SUPPORT_RATES.sleep_in.small; nightLabel = '体制II (小規模)'; }
            else if (totalResidents <= 20) { nightUnit = NIGHT_SUPPORT_RATES.sleep_in.medium; nightLabel = '体制II (中規模)'; }
            else { nightUnit = NIGHT_SUPPORT_RATES.sleep_in.large; nightLabel = '体制II (大規模)'; }
        } else if (nightShiftType === 'on_call') {
            nightUnit = NIGHT_SUPPORT_RATES.on_call.fixed;
            nightLabel = '体制III (連絡体制)';
        }

        const profUnit = PROFESSIONAL_DAILY[config.professionalStaffType];

        let totalMonthlyUnits = 0;

        // Iterate Residents
        (Object.keys(residents) as Array<keyof ResidentState>).forEach(cls => {
            const count = residents[cls];
            if (count === 0) return;

            const labelCls = cls.replace('class', '区分');

            // A. Base
            const baseDaily = BASE_UNITS_STANDARD[cls] || 0;
            const baseLineUnits = baseDaily * operatingDays * count;
            totalMonthlyUnits += baseLineUnits;

            rows.push({
                id: `revenue-base-${cls}`,
                label: `[${labelCls}] 基本報酬`,
                unitPrice: baseDaily,
                days: operatingDays,
                count: count,
                formula: `${baseDaily}単位 x ${operatingDays}日 x ${count}人`,
                subtotal: Math.floor(baseLineUnits * regionalUnitPrice),
                category: 'Revenue',
            });

            // B. Staffing Addition
            // @ts-ignore
            const staffingAdd = STAFFING_ADDITIONS[ratioType][cls] || 0;
            if (staffingAdd > 0) {
                const staffingLineUnits = staffingAdd * operatingDays * count;
                totalMonthlyUnits += staffingLineUnits;

                rows.push({
                    id: `revenue-staff-${cls}`,
                    label: `[${labelCls}] 人員配置体制加算 (${ratioType})`,
                    unitPrice: staffingAdd,
                    days: operatingDays,
                    count: count,
                    formula: `${staffingAdd}単位 x ${operatingDays}日 x ${count}人`,
                    subtotal: Math.floor(staffingLineUnits * regionalUnitPrice),
                    category: 'Revenue',
                });
            }

            // C. Night Support (Per Resident)
            if (nightUnit > 0) {
                const nightLineUnits = nightUnit * operatingDays * count;
                totalMonthlyUnits += nightLineUnits;

                rows.push({
                    id: `revenue-night-${cls}`,
                    label: `[${labelCls}] 夜間支援等体制加算 (${nightLabel})`,
                    unitPrice: nightUnit,
                    days: operatingDays,
                    count: count,
                    formula: `${nightUnit}単位 x ${operatingDays}日 x ${count}人`,
                    subtotal: Math.floor(nightLineUnits * regionalUnitPrice),
                    category: 'Revenue',
                });
            }

            // D. Prof
            if (profUnit > 0) {
                const profLineUnits = profUnit * operatingDays * count;
                totalMonthlyUnits += profLineUnits;

                rows.push({
                    id: `revenue-prof-${cls}`,
                    label: `[${labelCls}] 福祉専門職員配置等加算 (${config.professionalStaffType})`,
                    unitPrice: profUnit,
                    days: operatingDays,
                    count: count,
                    formula: `${profUnit}単位 x ${operatingDays}日 x ${count}人`,
                    subtotal: Math.floor(profLineUnits * regionalUnitPrice),
                    category: 'Revenue',
                });
            }
        });

        // Treatment Imp
        const { treatment, special, baseUp } = config.treatmentImprovementRates;
        const totalRate = treatment + special + baseUp;
        const baseRewardYen = Math.floor(totalMonthlyUnits * regionalUnitPrice);
        let treatmentAmount = 0;

        if (totalRate > 0) {
            treatmentAmount = Math.floor(baseRewardYen * (totalRate / 100));
            rows.push({
                id: 'add-treatment',
                label: `処遇改善加算等 (計${totalRate}%)`,
                unitPrice: '-',
                days: '-',
                count: '-',
                formula: `${totalMonthlyUnits.toLocaleString()}単位 (${baseRewardYen.toLocaleString()}円) x ${totalRate}%`,
                subtotal: treatmentAmount,
                category: 'Revenue',
            });
        }

        const monthlyRevenue = baseRewardYen + treatmentAmount;

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
            staffingRatioType: ratioType,
            monthlyRevenue,
            monthlyPersonnelCost,
            monthlyProfit: monthlyRevenue - monthlyPersonnelCost,
            breakdownRows: rows,
            nightSupportInfo: { label: nightLabel, unit: nightUnit }
        };

    }, [config]);

    return { config, setConfigField, setResident, results };
};
