// App.js - Version complète corrigée avec Register
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import MaterielsTable from "./components/materiels/MaterielsTable";
import AchatTable from "./components/achats/AchatTable";
import AchatTableExcel from "./components/achats/AchatTableExcel";
import AddPrixExcel from "./components/achats/AddPrixExcel";
import AddPrixManuel from "./components/achats/AddPrixManuel";
import AddAchat from "./components/achats/AddAchat";
import AttributionMateriel from "./components/materiels/AttributionMateriel";
import ReaffectationMateriel from "./components/materiels/ReaffectationMateriel";
import MultiReaffectation from "./components/materiels/MultiReaffectation";
import HistoriqueMateriel from "./components/materiels/HistoriqueMateriel";
import GestionFournisseurs from "./components/fournisseur/GestionFournisseurs";
import AffectationComplete from "./components/materiels/AffectationComplete";
import ConsultationPrixAchat from "./components/achats/ConsultationPrixAchat ";
import PrisesEnChargeAchat from "./components/beneficiaire/PrisesEnChargeAchat";
import PriseEnCharge from "./components/beneficiaire/PriseEnCharge";
import PreparationAffectationMateriel from "./components/achats/PreparationMateriels";
import PreparationMateriels from "./components/achats/PreparationMateriels";
import GestionBeneficiaires from "./components/beneficiaire/GestionBeneficiaires";
import PreparationInventaire from "./components/BPI/PreparationInventaire";
import Login from "./components/Login/Login";


import { getDefaultRouteByRole, isRouteAllowed } from "./config/roleRoutes";
import Register from "./components/Login/Register";
import GestionUtilisateurs from "./components/GesUtilisateurs/GestionUtilisateurs";
import DemandesReaffectation from "./components/materiels/DemandesReaffectation";
import PVDemandesDownload from "./components/materiels/PVDemandesDownload";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!(user && token);
  });
  
  const [userRole, setUserRole] = useState(() => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || 'USER';
      } catch (e) {
        return 'USER';
      }
    }
    return 'USER';
  });

  // État pour gérer l'affichage login/register
  const [showRegister, setShowRegister] = useState(false);

  // Fonctions de navigation entre login et register
  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    // Optionnel: toast.success('Inscription réussie ! Connectez-vous');
  };

  const handleLoginSuccess = (userData) => {
    console.log("Login success, userData:", userData);
    setIsAuthenticated(true);
    setUserRole(userData.role || 'USER');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole('USER');
    setShowRegister(false);
  };

  // Composant pour l'authentification (Login ou Register)
  const AuthContainer = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
      if (isAuthenticated) {
        const defaultRoute = getDefaultRouteByRole(userRole);
        navigate(defaultRoute, { replace: true });
      }
    }, [isAuthenticated, userRole, navigate]);
    
    // Afficher Register ou Login selon l'état
    if (showRegister) {
      return (
        <Register 
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />
    );
  };

  // Composant ProtectedRoute avec vérification des rôles
  const ProtectedRoute = ({ children, requiredRole }) => {
    const currentRole = userRole;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    // Vérifier si l'utilisateur a le rôle requis
    if (requiredRole && currentRole !== requiredRole && currentRole !== 'ADMIN') {
      // Rediriger vers la page par défaut de son rôle
      const defaultRoute = getDefaultRouteByRole(currentRole);
      return <Navigate to={defaultRoute} replace />;
    }
    
    return children;
  };

  // Layout avec vérification des routes
  const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
      // Vérifier si la route actuelle est autorisée pour le rôle
      if (isAuthenticated && !isRouteAllowed(userRole, location.pathname)) {
        const defaultRoute = getDefaultRouteByRole(userRole);
        navigate(defaultRoute, { replace: true });
      }
    }, [location.pathname, userRole, isAuthenticated, navigate]);
    
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar onLogout={handleLogout} userRole={userRole} />
        <div className="flex-1 flex flex-col ml-64">
          <Header onLogout={handleLogout} userRole={userRole} />
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              {/* Routes accessibles à tous les utilisateurs authentifiés */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MaterielsTable />
                </ProtectedRoute>
              } />
              <Route path="/materiels" element={
                <ProtectedRoute>
                  <MaterielsTable />
                </ProtectedRoute>
              } />
              <Route path="/HistoriqueMateriel" element={
                <ProtectedRoute>
                  <HistoriqueMateriel />
                </ProtectedRoute>
              } />
              <Route path="/ConsultationPrixAchat" element={
                <ProtectedRoute>
                  <ConsultationPrixAchat />
                </ProtectedRoute>
              } />
              <Route path="/attributions/PrisesEnChargeAchat" element={
                <ProtectedRoute>
                  <PrisesEnChargeAchat />
                </ProtectedRoute>
              } />
              <Route path="/prise-en-charge/:achatId" element={
                <ProtectedRoute>
                  <PriseEnCharge />
                </ProtectedRoute>
              } />
              <Route path="/prise-en-charge" element={
                <ProtectedRoute>
                  <PriseEnCharge />
                </ProtectedRoute>
              } />
              <Route path="/preparation-inventaire" element={
                <ProtectedRoute>
                  <PreparationInventaire />
                </ProtectedRoute>
              } />
                            <Route path="/demandes-reaffectation" element={
                <ProtectedRoute>
                  <DemandesReaffectation />
                </ProtectedRoute>
              } />

                            <Route path="/MultiReaffectation" element={
                <ProtectedRoute >
                  <MultiReaffectation />
                </ProtectedRoute>
              } />

                                          <Route path="/pvs-transferts" element={
                <ProtectedRoute >
                  <PVDemandesDownload />
                </ProtectedRoute>
              } />

              {/* Routes pour ADMIN et GESTIONNAIRE uniquement */}
              <Route path="/achats" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AchatTable />
                </ProtectedRoute>
              } />
              <Route path="/achats-excel" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AchatTableExcel />
                </ProtectedRoute>
              } />
              <Route path="/add-achats-excel" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AddPrixExcel />
                </ProtectedRoute>
              } />
              <Route path="/add-achats-manuel" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AddPrixManuel />
                </ProtectedRoute>
              } />
              <Route path="/add-achat" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AddAchat />
                </ProtectedRoute>
              } />
              <Route path="/ReaffectationMateriel" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <ReaffectationMateriel />
                </ProtectedRoute>
              } />
              <Route path="/AttributionMateriel" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AttributionMateriel />
                </ProtectedRoute>
              } />

              <Route path="/GestionFournisseurs" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <GestionFournisseurs />
                </ProtectedRoute>
              } />
              <Route path="/AffectationComplete" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <AffectationComplete />
                </ProtectedRoute>
              } />
              <Route path="/preparation-affectation-materiel" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <PreparationMateriels />
                </ProtectedRoute>
              } />

              <Route path="/gestion-beneficiaires" element={
                <ProtectedRoute requiredRole={['ADMIN', 'GESTIONNAIRE']}>
                  <GestionBeneficiaires />
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="ADMIN">
                <GestionUtilisateurs />
              </ProtectedRoute>
            } />

              {/* Routes ADMIN uniquement */}
              {/* <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <GestionUtilisateurs />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Parametres />
                </ProtectedRoute>
              } /> */}
            </Routes>
          </main>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthContainer />} />
        <Route path="/*" element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;