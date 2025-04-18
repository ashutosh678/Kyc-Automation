import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
	FileText,
	Edit,
	ExternalLink,
	AlertCircle,
	CheckCircle2,
	Clock,
	XCircle,
	Info,
	Download,
	FileCheck,
	Printer,
	RefreshCw,
	Share2,
} from "lucide-react";
import companyService from "../services/companyService";

const StatusBadge = ({ status }) => {
	const getStatusStyles = () => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-700 border-green-300";
			case "pending":
				return "bg-amber-100 text-amber-700 border-amber-300";
			default:
				return "bg-gray-100 text-gray-700 border-gray-300";
		}
	};

	const getStatusText = () => {
		switch (status) {
			case "completed":
				return "Completed";
			case "pending":
				return "Pending";
			default:
				return "Not Started";
		}
	};

	const getStatusIcon = () => {
		switch (status) {
			case "completed":
				return <CheckCircle2 size={16} className="mr-1.5" />;
			case "pending":
				return <Clock size={16} className="mr-1.5" />;
			default:
				return <XCircle size={16} className="mr-1.5" />;
		}
	};

	return (
		<span
			className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyles()}`}
		>
			{getStatusIcon()}
			{getStatusText()}
		</span>
	);
};

const CompanyDetails = () => {
	const { id } = useParams();
	const [companyDetails, setCompanyDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("overview");
	const [refreshing, setRefreshing] = useState(false);
	const [completionStatus, setCompletionStatus] = useState({
		requiredFields: 0,
		completedFields: 0,
		percentage: 0,
	});

	useEffect(() => {
		const fetchCompanyDetails = async () => {
			try {
				setLoading(true);
				const response = await companyService.getCompanyDetails();

				if (response.success) {
					setCompanyDetails(response.data);
					calculateCompletionStatus(response.data);
				} else {
					setError("No company details found");
				}
			} catch (err) {
				console.error("Error fetching company details:", err);
				setError("Failed to load company details");
			} finally {
				setLoading(false);
			}
		};

		fetchCompanyDetails();
	}, []);

	const calculateCompletionStatus = (data) => {
		// Define all required fields
		const requiredFields = [
			"intendedCompanyName",
			"companyActivities",
			"intendedRegisteredAddress",
			"financialYearEnd",
			"constitution",
		];

		// Check how many fields are completed
		const completedFields = requiredFields.filter(
			(field) => !!data && !!data[field]
		).length;

		// Calculate percentage
		const percentage = data
			? Math.round((completedFields / requiredFields.length) * 100)
			: 0;

		setCompletionStatus({
			requiredFields: requiredFields.length,
			completedFields,
			percentage,
		});
	};

	const handleRefresh = async () => {
		try {
			setRefreshing(true);
			const response = await companyService.getCompanyDetails();
			setCompanyDetails(response.data);
			calculateCompletionStatus(response.data);

			// Show a success toast or feedback here if needed
		} catch (err) {
			console.error("Error refreshing company details:", err);
			setError("Failed to refresh data");
		} finally {
			setRefreshing(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
					<p className="mt-4 text-blue-600 font-medium">
						Loading document details...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-md">
				<div className="flex items-center mb-4">
					<AlertCircle className="text-red-500 mr-3" size={24} />
					<h3 className="text-lg font-semibold text-red-800">
						Error Loading Data
					</h3>
				</div>
				<p className="text-red-700 mb-4">{error}</p>
				<button
					onClick={handleRefresh}
					className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition"
				>
					<RefreshCw size={18} className="mr-2" /> Try Again
				</button>
			</div>
		);
	}

	if (!companyDetails) {
		return (
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 rounded-xl shadow-md">
				<div className="flex flex-col md:flex-row md:items-center">
					<div className="mb-6 md:mb-0 md:mr-6">
						<Info className="text-blue-500 h-16 w-16" />
					</div>
					<div>
						<h3 className="text-xl font-bold text-blue-800 mb-3">
							No KYC Documents Found
						</h3>
						<p className="text-blue-700 mb-6 text-lg">
							It looks like you haven't started your KYC verification process
							yet. Begin by uploading your documents.
						</p>
						<Link
							to="/company-details-form"
							className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition shadow-md"
						>
							<FileText size={18} className="mr-2" /> Start Verification
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const getStatusIcon = (field) => {
		if (!companyDetails[field]) {
			return <XCircle size={18} className="text-red-500" />;
		}
		return <CheckCircle2 size={18} className="text-green-500" />;
	};

	const getStatusClass = (isCompleted) => {
		return isCompleted
			? "border-green-200 bg-green-50"
			: "border-amber-200 bg-amber-50 opacity-80";
	};

	const renderDetailSection = (title, data, fileUrl, fieldKey) => {
		const isCompleted = !!data;
		const status = isCompleted ? "completed" : "pending";

		return (
			<div
				className={`mb-8 border rounded-xl overflow-hidden shadow-sm ${getStatusClass(
					isCompleted
				)}`}
			>
				<div className="px-6 py-4 bg-white border-b flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-800 flex items-center">
						{title}
					</h3>
					<StatusBadge status={status} />
				</div>

				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm font-medium text-gray-500 mb-2">
								Information
							</p>
							{data ? (
								<div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
									<p className="text-gray-800">{data}</p>
								</div>
							) : (
								<div className="bg-white border border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
									<p className="text-gray-500 italic">
										No information provided yet
									</p>
								</div>
							)}
						</div>

						<div>
							<p className="text-sm font-medium text-gray-500 mb-2">
								Supporting Document
							</p>
							{fileUrl ? (
								<div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col">
									<div className="flex items-center mb-3">
										<FileCheck size={20} className="text-green-500 mr-2" />
										<p className="text-gray-700 font-medium">
											Document uploaded
										</p>
									</div>
									<div className="flex flex-wrap gap-2 mt-2">
										<a
											href={fileUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md font-medium transition"
										>
											<Download size={16} className="mr-1.5" />
											Download
										</a>
										<a
											href={fileUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-md font-medium transition"
										>
											<ExternalLink size={16} className="mr-1.5" />
											View
										</a>
									</div>
								</div>
							) : (
								<div className="bg-white border border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
									<p className="text-gray-500 italic">No document uploaded</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div>
			<div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-200">
				<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 text-white">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div className="mb-4 md:mb-0">
							<h1 className="text-3xl font-bold">KYC Document Verification</h1>
							<p className="text-blue-100 mt-2 text-lg">
								Track your verification progress
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={handleRefresh}
								disabled={refreshing}
								className={`inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition ${
									refreshing ? "opacity-70 cursor-not-allowed" : ""
								}`}
							>
								<RefreshCw
									size={18}
									className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
								/>
								{refreshing ? "Refreshing..." : "Refresh"}
							</button>
							<button className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition">
								<Printer size={18} className="mr-2" />
								Print
							</button>
						</div>
					</div>
				</div>

				<div>
					{/* Tabs */}
					<div className="flex border-b">
						<button
							onClick={() => setActiveTab("overview")}
							className={`px-6 py-3 font-medium text-sm focus:outline-none transition ${
								activeTab === "overview"
									? "border-b-2 border-blue-600 text-blue-600"
									: "text-gray-600 hover:text-gray-800"
							}`}
						>
							Overview
						</button>
						<button
							onClick={() => setActiveTab("documents")}
							className={`px-6 py-3 font-medium text-sm focus:outline-none transition ${
								activeTab === "documents"
									? "border-b-2 border-blue-600 text-blue-600"
									: "text-gray-600 hover:text-gray-800"
							}`}
						>
							Documents
						</button>
					</div>

					<div className="p-6">
						{activeTab === "overview" && (
							<>
								<div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
									<div className="mb-4 md:mb-0">
										<h2 className="text-xl font-bold text-gray-800">
											Verification Progress
										</h2>
										<p className="text-gray-600">
											{completionStatus.completedFields} of{" "}
											{completionStatus.requiredFields} required sections
											completed
										</p>
									</div>

									<div className="flex space-x-3">
										<Link
											to={`/company-details-form/${id}`}
											className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition shadow-md"
										>
											<Edit size={18} className="mr-2" /> Edit Details
										</Link>

										{completionStatus.percentage === 100 && (
											<button className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-800 transition shadow-md">
												<Download size={18} className="mr-2" /> Download
												Complete Package
											</button>
										)}

										<button className="inline-flex items-center bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
											<Share2 size={18} className="mr-1" />
										</button>
									</div>
								</div>

								<div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
									<div className="mb-3 flex justify-between items-center">
										<div>
											<h3 className="text-base font-semibold text-gray-700">
												Verification Status
											</h3>
											<p className="text-gray-500 text-sm">
												AI-powered document verification
											</p>
										</div>
										<div>
											<span className="text-xl font-bold text-blue-600">
												{completionStatus.percentage}%
											</span>
										</div>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-3">
										<div
											className={`h-3 rounded-full transition-all duration-500 ${
												completionStatus.percentage < 50
													? "bg-gradient-to-r from-red-500 to-amber-400"
													: completionStatus.percentage < 100
													? "bg-gradient-to-r from-amber-400 to-yellow-300"
													: "bg-gradient-to-r from-green-400 to-emerald-500"
											}`}
											style={{ width: `${completionStatus.percentage}%` }}
										></div>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
										<div
											className={`p-4 rounded-lg border ${
												companyDetails.intendedCompanyName
													? "border-green-200 bg-green-50"
													: "border-amber-200 bg-amber-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													{getStatusIcon("intendedCompanyName")}
													<span className="ml-2 font-medium text-gray-700">
														Company Name
													</span>
												</div>
											</div>
										</div>

										<div
											className={`p-4 rounded-lg border ${
												companyDetails.companyActivities
													? "border-green-200 bg-green-50"
													: "border-amber-200 bg-amber-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													{getStatusIcon("companyActivities")}
													<span className="ml-2 font-medium text-gray-700">
														Activities
													</span>
												</div>
											</div>
										</div>

										<div
											className={`p-4 rounded-lg border ${
												companyDetails.intendedRegisteredAddress
													? "border-green-200 bg-green-50"
													: "border-amber-200 bg-amber-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													{getStatusIcon("intendedRegisteredAddress")}
													<span className="ml-2 font-medium text-gray-700">
														Address
													</span>
												</div>
											</div>
										</div>

										<div
											className={`p-4 rounded-lg border ${
												companyDetails.financialYearEnd
													? "border-green-200 bg-green-50"
													: "border-amber-200 bg-amber-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													{getStatusIcon("financialYearEnd")}
													<span className="ml-2 font-medium text-gray-700">
														Financial Year
													</span>
												</div>
											</div>
										</div>

										<div
											className={`p-4 rounded-lg border ${
												companyDetails.constitution
													? "border-green-200 bg-green-50"
													: "border-amber-200 bg-amber-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													{getStatusIcon("constitution")}
													<span className="ml-2 font-medium text-gray-700">
														Constitution
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</>
						)}

						{activeTab === "documents" && (
							<div className="space-y-2">
								<h2 className="text-xl font-bold text-gray-800 mb-6">
									Document Details
								</h2>

								{renderDetailSection(
									"Intended Company Name",
									companyDetails.intendedCompanyName?.name,
									companyDetails.intendedCompanyName?.fileId?.fileUrl,
									"intendedCompanyName"
								)}

								{renderDetailSection(
									"Alternative Company Name 1",
									companyDetails.alternativeCompanyName1?.name,
									companyDetails.alternativeCompanyName1?.fileId?.fileUrl,
									"alternativeCompanyName1"
								)}

								{renderDetailSection(
									"Alternative Company Name 2",
									companyDetails.alternativeCompanyName2?.name,
									companyDetails.alternativeCompanyName2?.fileId?.fileUrl,
									"alternativeCompanyName2"
								)}

								{renderDetailSection(
									"Company Activities",
									companyDetails.companyActivities?.description,
									companyDetails.companyActivities?.fileId?.fileUrl,
									"companyActivities"
								)}

								{renderDetailSection(
									"Intended Registered Address",
									companyDetails.intendedRegisteredAddress?.address,
									companyDetails.intendedRegisteredAddress?.fileId?.fileUrl,
									"intendedRegisteredAddress"
								)}

								{renderDetailSection(
									"Financial Year End",
									companyDetails.financialYearEnd?.date,
									companyDetails.financialYearEnd?.fileId?.fileUrl,
									"financialYearEnd"
								)}

								{/* Constitution Section */}
								{companyDetails.constitution && (
									<div className="mb-8 border rounded-xl overflow-hidden shadow-sm border-green-200 bg-green-50">
										<div className="px-6 py-4 bg-white border-b flex items-center justify-between">
											<h3 className="text-lg font-semibold text-gray-800 flex items-center">
												Constitution
											</h3>
											<StatusBadge status="completed" />
										</div>

										<div className="p-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div>
													<p className="text-sm font-medium text-gray-500 mb-2">
														Information
													</p>
													<div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
														<p className="text-gray-600 mb-2">
															<span className="font-medium">Option:</span>{" "}
															{companyDetails.constitution.option}
														</p>
														<p className="text-gray-800">
															{companyDetails.constitution.description}
														</p>
													</div>
												</div>

												<div>
													<p className="text-sm font-medium text-gray-500 mb-2">
														Supporting Document
													</p>
													{companyDetails.constitution.fileId?.fileUrl ? (
														<div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col">
															<div className="flex items-center mb-3">
																<FileCheck
																	size={20}
																	className="text-green-500 mr-2"
																/>
																<p className="text-gray-700 font-medium">
																	Document uploaded
																</p>
															</div>
															<div className="flex flex-wrap gap-2 mt-2">
																<a
																	href={
																		companyDetails.constitution.fileId.fileUrl
																	}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md font-medium transition"
																>
																	<Download size={16} className="mr-1.5" />
																	Download
																</a>
																<a
																	href={
																		companyDetails.constitution.fileId.fileUrl
																	}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-md font-medium transition"
																>
																	<ExternalLink size={16} className="mr-1.5" />
																	View
																</a>
															</div>
														</div>
													) : (
														<div className="bg-white border border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
															<p className="text-gray-500 italic">
																No document uploaded
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								)}

								{!companyDetails.constitution &&
									renderDetailSection(
										"Constitution",
										null,
										null,
										"constitution"
									)}
							</div>
						)}
					</div>
				</div>

				<div className="px-6 pb-6">
					{completionStatus.percentage === 100 && (
						<div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
							<div className="flex items-start">
								<div className="bg-green-100 p-3 rounded-full mr-4">
									<CheckCircle2 size={24} className="text-green-600" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-green-800">
										Verification Complete!
									</h3>
									<p className="text-green-700 mt-2 text-lg">
										All required documents have been verified successfully. Your
										KYC verification process is complete.
									</p>
									<div className="mt-4 flex flex-wrap gap-3">
										<button className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition shadow-sm">
											<Download size={18} className="mr-2" /> Download
											Verification Certificate
										</button>
										<button className="inline-flex items-center bg-white border border-green-600 text-green-700 px-4 py-2 rounded-md font-medium hover:bg-green-50 transition">
											<Share2 size={18} className="mr-2" /> Share Results
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{completionStatus.percentage < 100 && (
						<div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
							<div className="flex items-start">
								<div className="bg-amber-100 p-3 rounded-full mr-4">
									<Info size={24} className="text-amber-600" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-amber-800">
										Verification In Progress
									</h3>
									<p className="text-amber-700 mt-2 text-lg">
										Please complete all required sections to finalize your KYC
										verification.
										{completionStatus.percentage > 0 &&
											` You've made progress (${completionStatus.percentage}%), but there's still work to do.`}
									</p>
									<div className="mt-4">
										<Link
											to={`/company-details-form/${id}`}
											className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition shadow-md"
										>
											<Edit size={18} className="mr-2" /> Continue Verification
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CompanyDetails;
