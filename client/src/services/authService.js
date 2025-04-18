import httpClient from "../utils/httpClient";

const authService = {
	signup: async (email, password) => {
		try {
			const response = await httpClient.post("/auth/signup", {
				email,
				password,
			});
			return response.data;
		} catch (error) {
			throw error.response?.data || { message: "Network error" };
		}
	},

	login: async (credentials) => {
		try {
			const response = await httpClient.post("/auth/login", credentials);
			return response.data;
		} catch (error) {
			throw error.response?.data || { message: "Network error" };
		}
	},

	logout: async () => {
		try {
			await httpClient.post("/auth/logout");
		} catch (error) {
			console.error("Logout error:", error);
		}
	},

	checkAuth: async () => {
		try {
			const response = await httpClient.get("/auth/check");
			return response.data;
		} catch (error) {
			throw error.response?.data || { message: "Auth check failed" };
		}
	},
};

export default authService;
