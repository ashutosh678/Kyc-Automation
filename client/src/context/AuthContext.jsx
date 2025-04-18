import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const response = await authService.checkAuth();
			if (response.success) {
				setUser(response.user);
				setIsAuthenticated(true);
			} else {
				handleLogout();
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			handleLogout();
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		setUser(null);
		setIsAuthenticated(false);
		navigate("/login");
	};

	const login = async (credentials) => {
		try {
			setLoading(true);
			const response = await authService.login(credentials);

			if (response.success) {
				setUser(response.user);
				setIsAuthenticated(true);
				navigate("/dashboard");
				return { success: true };
			}

			return { success: false, error: response.message };
		} catch (error) {
			return { success: false, error: error.message };
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			await authService.logout();
			handleLogout();
		} catch (error) {
			console.error("Logout failed:", error);
			// Still logout the user on the frontend even if the server request fails
			handleLogout();
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				isAuthenticated,
				login,
				logout,
				checkAuthStatus,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
