import httpClient from "../utils/httpClient";

const companyService = {
	createCompanyDetails: async (formData) => {
		try {
			const response = await httpClient.post("/company-details", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		} catch (error) {
			console.error("API Error:", error);
			if (error.response && error.response.data) {
				throw error.response.data;
			} else {
				throw new Error("Network error or server unavailable");
			}
		}
	},

	getCompanyDetails: async () => {
		try {
			const response = await httpClient.get("/company-details");
			return response.data;
		} catch (error) {
			if (error.response?.status === 401) {
				// Handle unauthorized error silently
				return null;
			}
			if (error.response?.status === 404) {
				// Handle not found case
				return { data: null };
			}
			throw error.response ? error.response.data : new Error("Network error");
		}
	},

	updateCompanyDetails: async (id, formData) => {
		try {
			const response = await httpClient.put(
				`/company-details/${id}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data;
		} catch (error) {
			throw error.response ? error.response.data : new Error("Network error");
		}
	},
};

export default companyService;
