import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";

import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import ProductsPage from "./components/ProductsPage";
import InventoryLogsPage from "./components/InventoryLogsPage";
import ReportsPage from "./components/ReportsPage";
import { fetchData } from "./utils/api";

function App() {
  // ...existing code...
}

export default App;
