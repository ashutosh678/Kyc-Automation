import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Components
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanyDetails from "./pages/CompanyDetails";
import CompanyDetailsForm from "./pages/CompanyDetailsForm";

const AppRoutes = () => {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route
					path="/company-details"
					element={
						<ProtectedRoute>
							<CompanyDetails />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/company-details-form"
					element={
						<ProtectedRoute>
							<CompanyDetailsForm />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Layout>
	);
};

const App = () => {
	return (
		<Router>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</Router>
	);
};

export default App;
