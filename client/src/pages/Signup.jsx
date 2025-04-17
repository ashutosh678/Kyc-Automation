import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Mail,
	Lock,
	AlertCircle,
	CheckCircle,
	ArrowRight,
	CheckCircle2,
	X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const { signup } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Reset error when inputs change
		if (email || password || confirmPassword) {
			setError("");
		}
	}, [email, password, confirmPassword]);

	const validateForm = () => {
		if (!email || !password || !confirmPassword) {
			setError("All fields are required");
			return false;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return false;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!validateForm()) return;

		try {
			setIsLoading(true);
			const result = await signup(email, password);

			if (result.success) {
				setSuccess("Account created successfully! Redirecting to login...");
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			} else {
				setError(result.error || "Failed to create account");
			}
		} catch (err) {
			setError("Failed to sign up. Please try again.");
			console.error("Signup error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	// Password validation
	const passwordLength = password.length >= 6;
	const passwordHasUpper = /[A-Z]/.test(password);
	const passwordHasNumber = /[0-9]/.test(password);
	const passwordsMatch = password && password === confirmPassword;

	return (
		<div className="max-w-md mx-auto">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Create Your Account
				</h1>
				<p className="text-gray-600">
					Join our platform to manage your KYC documents
				</p>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fadeIn">
					<div className="flex items-center">
						<AlertCircle
							className="text-red-500 mr-3 flex-shrink-0"
							size={20}
						/>
						<p className="text-red-700 text-sm font-medium">{error}</p>
					</div>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fadeIn">
					<div className="flex items-center">
						<CheckCircle
							className="text-green-500 mr-3 flex-shrink-0"
							size={20}
						/>
						<p className="text-green-700 text-sm font-medium">{success}</p>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
			>
				<div className="mb-5">
					<label
						htmlFor="email"
						className="block text-gray-700 font-medium mb-2"
					>
						Email Address
					</label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
							<Mail size={18} />
						</span>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
							placeholder="Enter your email"
							required
						/>
					</div>
				</div>

				<div className="mb-5">
					<label
						htmlFor="password"
						className="block text-gray-700 font-medium mb-2"
					>
						Password
					</label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
							<Lock size={18} />
						</span>
						<input
							type={showPassword ? "text" : "password"}
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
							placeholder="Create a password"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
						>
							{showPassword ? "Hide" : "Show"}
						</button>
					</div>

					<div className="mt-2 space-y-2">
						<div className="flex items-center">
							{passwordLength ? (
								<CheckCircle2 size={16} className="text-green-500 mr-2" />
							) : (
								<X size={16} className="text-gray-400 mr-2" />
							)}
							<span
								className={`text-sm ${
									passwordLength ? "text-green-600" : "text-gray-500"
								}`}
							>
								At least 6 characters
							</span>
						</div>
						<div className="flex items-center">
							{passwordHasUpper ? (
								<CheckCircle2 size={16} className="text-green-500 mr-2" />
							) : (
								<X size={16} className="text-gray-400 mr-2" />
							)}
							<span
								className={`text-sm ${
									passwordHasUpper ? "text-green-600" : "text-gray-500"
								}`}
							>
								At least 1 uppercase letter
							</span>
						</div>
						<div className="flex items-center">
							{passwordHasNumber ? (
								<CheckCircle2 size={16} className="text-green-500 mr-2" />
							) : (
								<X size={16} className="text-gray-400 mr-2" />
							)}
							<span
								className={`text-sm ${
									passwordHasNumber ? "text-green-600" : "text-gray-500"
								}`}
							>
								At least 1 number
							</span>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<label
						htmlFor="confirmPassword"
						className="block text-gray-700 font-medium mb-2"
					>
						Confirm Password
					</label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
							<Lock size={18} />
						</span>
						<input
							type={showPassword ? "text" : "password"}
							id="confirmPassword"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
							placeholder="Confirm your password"
							required
						/>
						{password && confirmPassword && (
							<span className="absolute right-3 top-1/2 transform -translate-y-1/2">
								{passwordsMatch ? (
									<CheckCircle2 size={18} className="text-green-500" />
								) : (
									<X size={18} className="text-red-500" />
								)}
							</span>
						)}
					</div>
					{password && confirmPassword && !passwordsMatch && (
						<p className="text-red-500 text-sm mt-1">Passwords do not match</p>
					)}
				</div>

				<div className="mb-6">
					<label className="inline-flex items-center">
						<input
							type="checkbox"
							className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							required
						/>
						<span className="ml-2 text-gray-700 text-sm">
							I agree to the{" "}
							<Link to="/terms" className="text-blue-600 hover:underline">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link to="/privacy" className="text-blue-600 hover:underline">
								Privacy Policy
							</Link>
						</span>
					</label>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition transform duration-200 flex items-center justify-center shadow-md"
				>
					{isLoading ? (
						<>
							<span className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
							Creating Account...
						</>
					) : (
						<>
							Create Account <ArrowRight size={18} className="ml-2" />
						</>
					)}
				</button>
			</form>

			<div className="text-center mt-6">
				<p className="text-gray-600">
					Already have an account?{" "}
					<Link
						to="/login"
						className="text-blue-600 hover:text-blue-800 font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Signup;
