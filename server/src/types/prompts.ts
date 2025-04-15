// server/src/types/prompts.ts
export const prompts = {
	intendedCompanyName: `Extract the company name in JSON format. Use the schema: {"name": "string"}. Please return only the JSON object without any additional text:`,
	companyActivities: `Extract the description in JSON format. Use the schema: {"description": "string"}. Please return only the JSON object without any additional text:`,
	intendedRegisteredAddress: `Extract the address in JSON format. Use the schema: {"address": "string"}. Please return only the JSON object without any additional text:`,
	financialYearEnd: `Extract the date in JSON format. Use the schema: {"date": "string"}. Please return only the JSON object without any additional text:`,
	constitution: `Extract the option in JSON format. Use the schema: {"option": "string"}. Please return only the JSON object without any additional text:`,
	alternativeCompanyName1: `Extract the name in JSON format. Use the schema: {"name": "string"}. Please return only the JSON object without any additional text:`,
	alternativeCompanyName2: `Extract the name in JSON format. Use the schema: {"name": "string"}. Please return only the JSON object without any additional text:`,
};
