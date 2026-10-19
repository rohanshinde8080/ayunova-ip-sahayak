import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { ProductClassificationPage } from '../pages/ProductClassificationPage';
import { IPProtectionAdvisorPage } from '../pages/IPProtectionAdvisorPage';
import { TraditionalKnowledgePage } from '../pages/TraditionalKnowledgePage';
import { IndiaVsInternationalPage } from '../pages/IndiaVsInternationalPage';
import { ComplianceChecklistPage } from '../pages/ComplianceChecklistPage';
import { DocumentAnalyzerPage } from '../pages/DocumentAnalyzerPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ResearchIntelligencePage } from '../pages/ResearchIntelligencePage';
import { AdminPage } from '../pages/AdminPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Innovator User Portal Hierarchy */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assistant" element={<AIAssistantPage />} />
          <Route path="/research" element={<ResearchIntelligencePage />} />
          <Route path="/classification" element={<ProductClassificationPage />} />
          <Route path="/ip-advisor" element={<IPProtectionAdvisorPage />} />
          <Route path="/traditional-knowledge" element={<TraditionalKnowledgePage />} />
          <Route path="/comparison" element={<IndiaVsInternationalPage />} />
          <Route path="/compliance" element={<ComplianceChecklistPage />} />
          <Route path="/document-analyzer" element={<DocumentAnalyzerPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>

        {/* Regulatory Admin Command Console Hierarchy */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
