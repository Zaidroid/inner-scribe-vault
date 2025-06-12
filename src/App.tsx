import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load the page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Journal = lazy(() => import('./pages/Journal'));
const Habits = lazy(() => import('./pages/Habits'));
const Finance = lazy(() => import('./pages/Finance'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const ActivityPage = lazy(() => import('./pages/Activity'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Auth = lazy(() => import('./pages/Auth'));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="selfmastery-theme">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/journal" element={<ProtectedRoute><Layout><Journal /></Layout></ProtectedRoute>} />
                  <Route path="/habits" element={<ProtectedRoute><Layout><Habits /></Layout></ProtectedRoute>} />
                  <Route path="/finance" element={<ProtectedRoute><Layout><Finance /></Layout></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                  <Route path="/activity" element={<ProtectedRoute><Layout><ActivityPage /></Layout></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
