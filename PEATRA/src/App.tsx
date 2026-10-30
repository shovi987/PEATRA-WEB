/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { INITIAL_SITES, INITIAL_INTERVENTIONS, INITIAL_MONITORING } from './data/mockData';
import { Site, Intervention, MonitoringObservation, OptimizationResult } from './types';
import { evaluateActions, solveMILP, applyScenario } from './utils/scoring';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PeatlandMapPage } from './pages/PeatlandMapPage';
import { PeatlandAssessmentPage } from './pages/PeatlandAssessmentPage';
import { SiteDiagnosisPage } from './pages/SiteDiagnosisPage';
import { InterventionComparisonPage } from './pages/InterventionComparisonPage';
import { OptimizationEnginePage } from './pages/OptimizationEnginePage';
import { BudgetSimulatorPage } from './pages/BudgetSimulatorPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { DataMethodologyPage } from './pages/DataMethodologyPage';
import { ReportsSettingsPage } from './pages/ReportsSettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedSiteId, setSelectedSiteId] = useState('A1');
  const [searchQuery, setSearchQuery] = useState('');

  // State data
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [interventions, setInterventions] = useState<Intervention[]>(INITIAL_INTERVENTIONS);
  const [monitoringList, setMonitoringList] = useState<MonitoringObservation[]>(INITIAL_MONITORING);

  // Model Parameters
  const [budget, setBudget] = useState<number>(1_000_000_000); // 1 Miliar
  const [weights, setWeights] = useState({ w_R: 0.40, w_W: 0.35, w_E: 0.25 });
  const [normMethod, setNormMethod] = useState<'fixed_ref' | 'linear_max' | 'min_max'>('fixed_ref');
  const [activeScenario, setActiveScenario] = useState<'Normal' | 'Musim Kering' | 'Risiko Kebakaran Tinggi'>('Normal');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Incorporate validated monitoring into active site state
  const activeSites = useMemo(() => {
    const updated = sites.map(s => ({ ...s }));
    const validated = monitoringList.filter(m => m.validation_status === 'Tervalidasi');

    validated.forEach(obs => {
      const target = updated.find(s => s.site_id === obs.site_id);
      if (target) {
        target.groundwater_depth = obs.groundwater_depth;
        target.canal_condition = obs.canal_condition;
        target.fire_risk_index = obs.fire_risk_index;
      }
    });

    return updated;
  }, [sites, monitoringList]);

  // Apply climate / risk scenario modifications
  const { sites: scenarioSites, interventions: scenarioInterventions } = useMemo(() => {
    return applyScenario(activeSites, interventions, activeScenario);
  }, [activeSites, interventions, activeScenario]);

  // Evaluate multi-criteria indicators & weights
  const { actions: evaluatedActions } = useMemo(() => {
    return evaluateActions(
      scenarioSites,
      scenarioInterventions,
      weights.w_R,
      weights.w_W,
      weights.w_E,
      normMethod
    );
  }, [scenarioSites, scenarioInterventions, weights, normMethod]);

  // Solve exact Binary MILP & Greedy baseline
  const optimizationResult: OptimizationResult = useMemo(() => {
    return solveMILP(evaluatedActions, budget);
  }, [evaluatedActions, budget]);

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 400);
  };

  const handleAddObservation = (obs: MonitoringObservation) => {
    setMonitoringList(prev => [obs, ...prev]);
  };

  const handleResetData = () => {
    setSites(INITIAL_SITES);
    setInterventions(INITIAL_INTERVENTIONS);
    setMonitoringList(INITIAL_MONITORING);
    setBudget(1_000_000_000);
    setWeights({ w_R: 0.40, w_W: 0.35, w_E: 0.25 });
    setActiveScenario('Normal');
  };

  return (
    <div className="flex h-screen w-screen bg-[#F7FAF8] text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pageTitle={currentPage}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {currentPage === 'dashboard' && (
              <DashboardPage
                sites={scenarioSites}
                optimizationResult={optimizationResult}
                budget={budget}
                onNavigate={setCurrentPage}
                onSelectSite={setSelectedSiteId}
                onRunOptimization={handleRunOptimization}
                isOptimizing={isOptimizing}
              />
            )}

            {currentPage === 'peatland_map' && (
              <PeatlandMapPage
                sites={scenarioSites}
                onSelectSite={setSelectedSiteId}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'assessment' && (
              <PeatlandAssessmentPage
                sites={scenarioSites}
                onSelectSite={setSelectedSiteId}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'site_diagnosis' && (
              <SiteDiagnosisPage
                sites={scenarioSites}
                selectedSiteId={selectedSiteId}
                onSelectSite={setSelectedSiteId}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'intervention_comparison' && (
              <InterventionComparisonPage
                sites={scenarioSites}
                selectedSiteId={selectedSiteId}
                onSelectSite={setSelectedSiteId}
                evaluatedActions={evaluatedActions}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'optimization_engine' && (
              <OptimizationEnginePage
                sites={scenarioSites}
                optimizationResult={optimizationResult}
                budget={budget}
                onBudgetChange={setBudget}
                weights={weights}
                onWeightsChange={setWeights}
                normMethod={normMethod}
                onNormMethodChange={setNormMethod}
                onRunOptimization={handleRunOptimization}
                isOptimizing={isOptimizing}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'budget_simulator' && (
              <BudgetSimulatorPage
                sites={scenarioSites}
                budget={budget}
                onBudgetChange={setBudget}
                optimizationResult={optimizationResult}
                onSelectSite={setSelectedSiteId}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'scenario_simulator' && (
              <ScenarioSimulatorPage
                sites={scenarioSites}
                activeScenario={activeScenario}
                onSelectScenario={setActiveScenario}
                optimizationResult={optimizationResult}
                onSelectSite={setSelectedSiteId}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'monitoring' && (
              <MonitoringPage
                sites={scenarioSites}
                selectedSiteId={selectedSiteId}
                onSelectSite={setSelectedSiteId}
                monitoringList={monitoringList}
                onAddObservation={handleAddObservation}
                onReOptimize={handleRunOptimization}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'data_methodology' && (
              <DataMethodologyPage
                sites={scenarioSites}
                interventions={scenarioInterventions}
              />
            )}

            {currentPage === 'reports_settings' && (
              <ReportsSettingsPage
                sites={scenarioSites}
                interventions={scenarioInterventions}
                monitoringList={monitoringList}
                optimizationResult={optimizationResult}
                budget={budget}
                onResetData={handleResetData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
