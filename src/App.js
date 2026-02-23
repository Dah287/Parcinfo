import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col ml-64">
          <Header />

          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<MaterielsTable />} />
              <Route path="/materiels" element={<MaterielsTable />} />
              <Route path="/achats" element={<AchatTable />} />
              <Route path="/achats-excel" element={<AchatTableExcel />} />
               <Route path="/add-achats-excel" element={<AddPrixExcel/>} />
               <Route path="/add-achats-manuel" element={<AddPrixManuel/>} />
                <Route path="/add-achat" element={<AddAchat/>} />
                 <Route path="/ReaffectationMateriel" element={<ReaffectationMateriel/>} />
                  <Route path="/AttributionMateriel" element={<AttributionMateriel/>} />
                   <Route path="/MultiReaffectation" element={<MultiReaffectation/>} />
                   <Route path="/HistoriqueMateriel" element={<HistoriqueMateriel/>} />
                   <Route path="/GestionFournisseurs" element={<GestionFournisseurs/>} />
                   <Route path="/AffectationComplete" element={<AffectationComplete/>} />
                     <Route path="/ConsultationPrixAchat" element={<ConsultationPrixAchat />} />
                      <Route path="/attributions/PrisesEnChargeAchat" element={<PrisesEnChargeAchat />} />
                      <Route path="/prise-en-charge/:achatId" element={<PriseEnCharge />} />
                      <Route path="/prise-en-charge" element={<PriseEnCharge />} />
                       <Route path="/preparation-affectation-materiel" element={<PreparationMateriels />} />
                        <Route path="/gestion-beneficiaires" element={<GestionBeneficiaires />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
