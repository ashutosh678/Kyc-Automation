import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key"; // Replace with your actual secret key

export const encodeToken = (payload: object): string => {
	return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

export const decodeToken = (token: string): any => {
	try {
		return jwt.verify(token, SECRET_KEY);
	} catch (error) {
		throw new Error("Invalid token");
	}
};
