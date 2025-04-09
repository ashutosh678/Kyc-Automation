import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectDB } from "./utils/database";

const port: string | number = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
