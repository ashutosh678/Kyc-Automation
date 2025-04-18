import axios from "axios";

const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const httpClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Important for cookies
	headers: {
		"Content-Type": "application/json",
	},
});

// Remove the token-related interceptor since we're using cookies
httpClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 || error.response?.status === 403) {
			// Only redirect if not already on login page
			if (!window.location.pathname.includes("/login")) {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	}
);

export default httpClient;
