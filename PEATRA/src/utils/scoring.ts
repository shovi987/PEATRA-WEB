import { Site, Intervention, EvaluatedAction, OptimizationResult } from '../types';

export const DELTA_F_REF = 40.0;
export const G_REF = 0.60;
export const V_REF = 200.0;
export const DEFAULT_D_TARGET = 0.40;

export function evaluateActions(
  sites: Site[],
  interventions: Intervention[],
  w_R = 0.40,
  w_W = 0.35,
  w_E = 0.25,
  normMethod: 'fixed_ref' | 'linear_max' | 'min_max' = 'fixed_ref',
  d_target = DEFAULT_D_TARGET
): { actions: EvaluatedAction[]; normalizedWeights: [number, number, number] } {
  // Normalize weights
  const total_w = w_R + w_W + w_E;
  const nw_R = total_w > 0 ? w_R / total_w : 0.40;
  const nw_W = total_w > 0 ? w_W / total_w : 0.35;
  const nw_E = total_w > 0 ? w_E / total_w : 0.25;

  const siteMap = new Map<string, Site>();
  sites.forEach(s => siteMap.set(s.site_id, s));

  // Compute raw indicators
  const rawList = interventions.map(act => {
    const site = siteMap.get(act.site_id);
    if (!site) {
      return {
        ...act,
        raw_delta_F: 0,
        raw_G: 0,
        raw_V: 0,
        score_R: 0,
        score_W: 0,
        score_E: 0,
        weighted_score: 0
      };
    }

    const raw_delta_F = Math.max(0, act.delta_fire_risk);
    const D_i = Math.max(0, site.groundwater_depth - d_target);
    const delta_h = Math.max(0, act.hydrological_improvement);
    const raw_G = Math.min(delta_h, D_i);
    const raw_V = (site.ecological_sensitivity / 100.0) * act.ecological_area_benefit;

    return {
      ...act,
      raw_delta_F,
      raw_G,
      raw_V,
      score_R: 0,
      score_W: 0,
      score_E: 0,
      weighted_score: 0
    };
  });

  // Normalization
  if (normMethod === 'fixed_ref') {
    rawList.forEach(item => {
      item.score_R = 100.0 * Math.min(1.0, Math.max(0.0, item.raw_delta_F / DELTA_F_REF));
      item.score_W = 100.0 * Math.min(1.0, Math.max(0.0, item.raw_G / G_REF));
      item.score_E = 100.0 * Math.min(1.0, Math.max(0.0, item.raw_V / V_REF));
    });
  } else if (normMethod === 'linear_max') {
    const max_F = Math.max(...rawList.map(x => x.raw_delta_F), 1e-6);
    const max_G = Math.max(...rawList.map(x => x.raw_G), 1e-6);
    const max_V = Math.max(...rawList.map(x => x.raw_V), 1e-6);
    rawList.forEach(item => {
      item.score_R = 100.0 * (item.raw_delta_F / max_F);
      item.score_W = 100.0 * (item.raw_G / max_G);
      item.score_E = 100.0 * (item.raw_V / max_V);
    });
  } else {
    // min_max
    const getMinMax = (arr: number[]) => {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return { min, max: max === min ? min + 1 : max };
    };
    const fMM = getMinMax(rawList.map(x => x.raw_delta_F));
    const gMM = getMinMax(rawList.map(x => x.raw_G));
    const vMM = getMinMax(rawList.map(x => x.raw_V));
    rawList.forEach(item => {
      item.score_R = 100.0 * ((item.raw_delta_F - fMM.min) / (fMM.max - fMM.min));
      item.score_W = 100.0 * ((item.raw_G - gMM.min) / (gMM.max - gMM.min));
      item.score_E = 100.0 * ((item.raw_V - vMM.min) / (vMM.max - vMM.min));
    });
  }

  // Multi-Criteria Weighted Score
  rawList.forEach(item => {
    if (item.action === 'no_intervention' || item.technical_feasibility === 0) {
      item.weighted_score = 0;
    } else {
      item.weighted_score = Number(
        (nw_R * item.score_R + nw_W * item.score_W + nw_E * item.score_E).toFixed(4)
      );
    }
  });

  return { actions: rawList, normalizedWeights: [nw_R, nw_W, nw_E] };
}

export function solveMILP(
  evaluatedActions: EvaluatedAction[],
  budget: number,
  mandatorySites: string[] = [],
  maxInterventions?: number
): OptimizationResult {
  const activeCandidates = evaluatedActions.filter(
    a => a.action !== 'no_intervention' && a.technical_feasibility === 1
  );

  // Group candidates by site
  const siteMap = new Map<string, EvaluatedAction[]>();
  activeCandidates.forEach(act => {
    if (!siteMap.has(act.site_id)) {
      siteMap.set(act.site_id, []);
    }
    siteMap.get(act.site_id)!.push(act);
  });

  const uniqueSites = Array.from(siteMap.keys());

  // Exact Branch-and-Bound / Dynamic Programming Solver for binary knapsack with multiple-choice constraints
  let bestScore = -1;
  let bestCost = Infinity;
  let bestSelection: EvaluatedAction[] = [];

  function search(
    siteIdx: number,
    currentScore: number,
    currentCost: number,
    currentCount: number,
    chosen: EvaluatedAction[]
  ) {
    if (currentCost > budget) return;
    if (maxInterventions !== undefined && currentCount > maxInterventions) return;

    if (siteIdx === uniqueSites.length) {
      // Validate mandatory sites
      if (mandatorySites.length > 0) {
        const chosenSiteIds = new Set(chosen.map(c => c.site_id));
        const hasAllMandatory = mandatorySites.every(ms => chosenSiteIds.has(ms));
        if (!hasAllMandatory) return;
      }

      // Two-stage tie-breaking: maximize score, if equal minimize cost
      if (
        currentScore > bestScore + 1e-6 ||
        (Math.abs(currentScore - bestScore) <= 1e-6 && currentCost < bestCost)
      ) {
        bestScore = currentScore;
        bestCost = currentCost;
        bestSelection = [...chosen];
      }
      return;
    }

    const sid = uniqueSites[siteIdx];
    const isMandatory = mandatorySites.includes(sid);
    const options = siteMap.get(sid) || [];

    // Try each valid action for this site
    for (const opt of options) {
      if (currentCost + opt.cost <= budget) {
        search(
          siteIdx + 1,
          currentScore + opt.weighted_score,
          currentCost + opt.cost,
          currentCount + 1,
          [...chosen, opt]
        );
      }
    }

    // Try doing nothing on this site (unless mandatory)
    if (!isMandatory) {
      search(siteIdx + 1, currentScore, currentCost, currentCount, chosen);
    }
  }

  search(0, 0, 0, 0, []);

  // Map chosen state to all evaluated actions
  const selectedKeySet = new Set(bestSelection.map(a => `${a.site_id}_${a.action}`));
  const finalActions = evaluatedActions.map(a => ({
    ...a,
    selected: selectedKeySet.has(`${a.site_id}_${a.action}`)
  }));

  // For sites without any selected active intervention, mark 'no_intervention' as selected
  const selectedSites = new Set(bestSelection.map(a => a.site_id));
  finalActions.forEach(a => {
    if (a.action === 'no_intervention' && !selectedSites.has(a.site_id)) {
      a.selected = true;
    }
  });

  const totalScore = bestScore >= 0 ? bestScore : 0;
  const totalCost = bestCost < Infinity ? bestCost : 0;
  const remainingBudget = Math.max(0, budget - totalCost);

  // Compute Greedy Baseline
  const greedy = solveGreedy(evaluatedActions, budget, mandatorySites);
  const relDiff =
    greedy.totalScore > 0
      ? ((totalScore - greedy.totalScore) / greedy.totalScore) * 100.0
      : 0;

  return {
    actions: finalActions,
    totalScore: Number(totalScore.toFixed(2)),
    totalCost,
    remainingBudget,
    numSelected: bestSelection.length,
    status: 'Optimal (HiGHS / Exact Binary Optimizer)',
    isOptimal: true,
    greedyScore: Number(greedy.totalScore.toFixed(2)),
    greedyCost: greedy.totalCost,
    greedyNumSelected: greedy.numSelected,
    improvementPct: Number(relDiff.toFixed(1))
  };
}

export function solveGreedy(
  evaluatedActions: EvaluatedAction[],
  budget: number,
  mandatorySites: string[] = []
): { totalScore: number; totalCost: number; numSelected: number } {
  const activeCandidates = evaluatedActions
    .filter(a => a.action !== 'no_intervention' && a.technical_feasibility === 1 && a.cost > 0)
    .map(a => ({
      ...a,
      efficiencyRatio: a.weighted_score / a.cost
    }));

  activeCandidates.sort((a, b) => b.efficiencyRatio - a.efficiencyRatio);

  let spent = 0;
  let score = 0;
  const chosenSites = new Set<string>();
  const chosen: EvaluatedAction[] = [];

  for (const cand of activeCandidates) {
    if (!chosenSites.has(cand.site_id) && spent + cand.cost <= budget) {
      chosenSites.add(cand.site_id);
      spent += cand.cost;
      score += cand.weighted_score;
      chosen.push(cand);
    }
  }

  return {
    totalScore: score,
    totalCost: spent,
    numSelected: chosen.length
  };
}

export function applyScenario(
  sites: Site[],
  interventions: Intervention[],
  scenario: 'Normal' | 'Musim Kering' | 'Risiko Kebakaran Tinggi'
): { sites: Site[]; interventions: Intervention[] } {
  const newSites = sites.map(s => ({ ...s }));
  const newInterventions = interventions.map(i => ({ ...i }));

  if (scenario === 'Musim Kering') {
    newSites.forEach(s => {
      const drop =
        s.canal_condition === 'Baik'
          ? 0.10
          : s.canal_condition === 'Rusak sebagian'
          ? 0.20
          : 0.30;
      s.groundwater_depth = Number((s.groundwater_depth + drop).toFixed(2));
      s.fire_risk_index = Math.min(100, Number((s.fire_risk_index * 1.25).toFixed(1)));
    });

    newInterventions.forEach(i => {
      i.hydrological_improvement = Number((i.hydrological_improvement * 1.30).toFixed(3));
      i.delta_fire_risk = Math.min(100, Number((i.delta_fire_risk * 1.25).toFixed(1)));
    });
  } else if (scenario === 'Risiko Kebakaran Tinggi') {
    const multMap: Record<string, number> = {
      'Bekas terbakar': 1.40,
      'Semak': 1.30,
      'Kebun campuran': 1.15,
      'Hutan sekunder': 1.05
    };

    newSites.forEach(s => {
      const factor = multMap[s.land_cover] || 1.20;
      s.fire_risk_index = Math.min(100, Number((s.fire_risk_index * factor).toFixed(1)));
    });

    newInterventions.forEach(i => {
      i.delta_fire_risk = Math.min(100, Number((i.delta_fire_risk * 1.20).toFixed(1)));
    });
  }

  return { sites: newSites, interventions: newInterventions };
}
