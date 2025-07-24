import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HousingTrendsPage from "./pages/HousingTrendsPage";
import IncomeTrendsPage from "./pages/IncomeTrendsPage";
import WhereCanLivePage from "./pages/WhereCanLivePage";
import ReverseLookupPage from "./pages/ReverseLookupPage";
import AffordabilityRankingPage from "./pages/AffordabilityRankingPage";
import IncomeGrowthPage from "./pages/IncomeGrowthPage";
import HeatmapPage from "./pages/HeatmapPage";
import DataGapsPage from "./pages/DataGapsPage";
import MonthlySummaryPage from "./pages/MonthlySummaryPage";
import DownPaymentSimulatorPage from "./pages/DownpaymentPage";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/housing" element={<HousingTrendsPage />} />
        <Route path="/income" element={<IncomeTrendsPage />} />
        <Route path="/quiz" element={<WhereCanLivePage />} />
        <Route path="/reverse-lookup" element={<ReverseLookupPage />} />
        <Route path="/ranking" element={<AffordabilityRankingPage />} />
        <Route path="/income-growth" element={<IncomeGrowthPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
        <Route path="/data-gaps" element={<DataGapsPage />} />
        <Route path="/monthly-summary" element={<MonthlySummaryPage />} />
        <Route path="/simulator" element={<DownPaymentSimulatorPage />} />
      </Routes>
    </div>
  );
}

export default App;
