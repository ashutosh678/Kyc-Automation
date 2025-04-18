import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading, checkAuthStatus } = useAuth();
	const location = useLocation();

	useEffect(() => {
		if (!isAuthenticated && !loading) {
			checkAuthStatus();
		}
	}, [isAuthenticated, loading, checkAuthStatus]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-50">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-indigo-600"></div>
					<p className="mt-4 text-indigo-600 font-medium">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		// Redirect to login while saving the attempted URL
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
};

export default ProtectedRoute;
