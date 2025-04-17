import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
	Upload,
	AlertCircle,
	CheckCircle,
	ChevronLeft,
	X,
	Info,
	Save,
	Eye,
	ArrowRight,
} from "lucide-react";
import companyService from "../services/companyService";
import StepIndicator from "../components/StepIndicator";

const CompanyDetailsForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Initialize with default values
	const [formData, setFormData] = useState({
		constitutionOption: "",
	});

	const [files, setFiles] = useState({
		intendedCompanyName: null,
		alternativeCompanyName1: null,
		alternativeCompanyName2: null,
		companyActivities: null,
		intendedRegisteredAddress: null,
		financialYearEnd: null,
		constitution: null,
	});

	const [filePreview, setFilePreview] = useState({
		intendedCompanyName: null,
		alternativeCompanyName1: null,
		alternativeCompanyName2: null,
		companyActivities: null,
		intendedRegisteredAddress: null,
		financialYearEnd: null,
		constitution: null,
	});

	const [activeStep, setActiveStep] = useState(1);
	const totalSteps = 3;

	useEffect(() => {
		if (id) {
			fetchCompanyDetails();
		}
	}, [id]);

	const fetchCompanyDetails = async () => {
		try {
			setIsFetching(true);
			const response = await companyService.getCompanyDetails(id);
			const data = response.data;

			if (data) {
				// Remove formData population
				// Set file previews
				setFilePreview({
					intendedCompanyName:
						data.intendedCompanyName?.fileId?.fileUrl || null,
					alternativeCompanyName1:
						data.alternativeCompanyName1?.fileId?.fileUrl || null,
					alternativeCompanyName2:
						data.alternativeCompanyName2?.fileId?.fileUrl || null,
					companyActivities: data.companyActivities?.fileId?.fileUrl || null,
					intendedRegisteredAddress:
						data.intendedRegisteredAddress?.fileId?.fileUrl || null,
					financialYearEnd: data.financialYearEnd?.fileId?.fileUrl || null,
					constitution: data.constitution?.fileId?.fileUrl || null,
				});
			}
		} catch (err) {
			console.error("Error fetching company details:", err);
			setError("Failed to load existing company details");
		} finally {
			setIsFetching(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleFileChange = (e) => {
		const { name, files: fileList } = e.target;
		if (fileList.length > 0) {
			const file = fileList[0];

			// Create object URL for preview
			const fileUrl = URL.createObjectURL(file);

			setFiles((prev) => ({
				...prev,
				[name]: file,
			}));

			setFilePreview((prev) => ({
				...prev,
				[name]: fileUrl,
			}));
		}
	};

	const removeFile = (fieldName) => {
		setFiles((prev) => ({
			...prev,
			[fieldName]: null,
		}));

		// Revoke object URL to prevent memory leaks
		if (filePreview[fieldName] && !filePreview[fieldName].startsWith("http")) {
			URL.revokeObjectURL(filePreview[fieldName]);
		}

		setFilePreview((prev) => ({
			...prev,
			[fieldName]: null,
		}));
	};

	const nextStep = () => {
		if (activeStep < totalSteps) {
			setActiveStep(activeStep + 1);
			window.scrollTo(0, 0);
		}
	};

	const prevStep = () => {
		if (activeStep > 1) {
			setActiveStep(activeStep - 1);
			window.scrollTo(0, 0);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		console.log("Form can be submitted without files");

		const formPayload = new FormData();

		// Add files - this is critical as the backend extracts text from these files
		Object.entries(files).forEach(([key, file]) => {
			if (file) {
				formPayload.append(key, file);
			}
		});

		// Append the selected constitution option
		formPayload.append("option", formData.constitutionOption);

		// If updating, include the ID
		if (id) {
			formPayload.append("id", id);
		}

		try {
			setIsLoading(true);
			console.log("Submitting form...");
			let response;

			if (id) {
				response = await companyService.updateCompanyDetails(id, formPayload);
				setSuccess("Your KYC documents have been updated successfully!");
			} else {
				response = await companyService.createCompanyDetails(formPayload);
				setSuccess("Your KYC documents have been submitted successfully!");
			}

			console.log("Form submitted successfully");

			setTimeout(() => {
				if (response.data && response.data._id) {
					navigate(`/company-details/${response.data._id}`);
				} else if (id) {
					navigate(`/company-details/${id}`);
				} else {
					navigate("/company-details");
				}
			}, 2000);
		} catch (err) {
			console.error("Error submitting company details:", err);
			if (err.message) {
				setError(err.message);
			} else {
				setError("Failed to submit your documents. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const FileUploadField = ({
		name,
		label,
		file,
		preview,
		required = false,
	}) => {
		const fileRef = React.createRef();

		const getFileIcon = (filename) => {
			if (!filename) return null;

			const extension = filename.split(".").pop().toLowerCase();

			switch (extension) {
				case "pdf":
					return (
						<div className="bg-red-100 text-red-700 p-1.5 rounded">
							<span className="text-xs font-medium">PDF</span>
						</div>
					);
				case "doc":
				case "docx":
					return (
						<div className="bg-blue-100 text-blue-700 p-1.5 rounded">
							<span className="text-xs font-medium">DOC</span>
						</div>
					);
				case "jpg":
				case "jpeg":
				case "png":
					return (
						<div className="bg-green-100 text-green-700 p-1.5 rounded">
							<span className="text-xs font-medium">IMG</span>
						</div>
					);
				default:
					return (
						<div className="bg-gray-100 text-gray-700 p-1.5 rounded">
							<span className="text-xs font-medium">FILE</span>
						</div>
					);
			}
		};

		return (
			<div>
				<div className="flex items-center justify-between mb-2">
					<label className="block text-gray-700 font-medium">
						{label} {required && <span className="text-red-500">*</span>}
					</label>
					{preview && (
						<a
							href={preview}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
						>
							<Eye size={16} className="mr-1" /> Preview
						</a>
					)}
				</div>

				{!files[name] && !preview ? (
					<div className="relative">
						<input
							ref={fileRef}
							type="file"
							name={name}
							onChange={handleFileChange}
							className="hidden"
							accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
							id={`${name}-file`}
							required={required && !preview}
						/>
						<label
							htmlFor={`${name}-file`}
							className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200"
						>
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
								<Upload className="w-8 h-8 mb-2 text-gray-500" />
								<p className="mb-1 text-sm text-gray-500">
									<span className="font-medium">Click to upload</span> or drag
									and drop
								</p>
								<p className="text-xs text-gray-500">
									PDF, DOC or images (max. 10MB)
								</p>
							</div>
						</label>
					</div>
				) : (
					<div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
						<div className="flex items-center overflow-hidden">
							{getFileIcon(files[name]?.name || preview)}
							<div className="ml-3 overflow-hidden">
								<p className="text-sm font-medium text-gray-900 truncate">
									{files[name]?.name || "Document " + name}
								</p>
								<p className="text-xs text-gray-500">
									{files[name]?.size
										? `${(files[name].size / 1024 / 1024).toFixed(2)} MB`
										: ""}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								onClick={() => fileRef.current.click()}
								className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
							>
								<Upload size={16} />
							</button>
							<button
								type="button"
								onClick={() => removeFile(name)}
								className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
							>
								<X size={16} />
							</button>
						</div>
						<input
							ref={fileRef}
							type="file"
							name={name}
							onChange={handleFileChange}
							className="hidden"
							accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
						/>
					</div>
				)}
			</div>
		);
	};

	const renderStepIndicator = ({ currentStep, totalSteps }) => {
		const steps = [
			{ number: 1, title: "Company Information" },
			{ number: 2, title: "Activities & Address" },
			{ number: 3, title: "Financial Details" },
		];

		// Calculate progress percentage
		const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

		return (
			<div className="mb-12">
				{/* Mobile Step Counter (visible only on small screens) */}
				<div className="block sm:hidden mb-6">
					<div className="text-center">
						<span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm">
							Step {currentStep} of {totalSteps}
						</span>
						<h4 className="mt-2 text-lg font-medium text-gray-800">
							{steps[currentStep - 1].title}
						</h4>
					</div>

					{/* Simple Progress Bar for Mobile */}
					<div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-blue-600 transition-all duration-500 ease-out"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				{/* Desktop Steps - only visible on sm screens and up */}
				<div className="hidden sm:block">
					<div className="grid grid-cols-3 gap-2">
						{steps.map((step, index) => (
							<div key={index} className="text-center">
								<div
									className={`
                mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${
									currentStep > step.number
										? "bg-blue-600 text-white"
										: currentStep === step.number
										? "bg-blue-600 text-white ring-4 ring-blue-100"
										: "bg-gray-200 text-gray-600"
								}
        		`}
								>
									{currentStep > step.number ? (
										<svg
											className="w-5 h-5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									) : (
										<span className="text-sm font-medium">{step.number}</span>
									)}
								</div>
								<div
									className={`text-sm font-medium ${
										currentStep >= step.number
											? "text-blue-700"
											: "text-gray-500"
									}`}
								>
									{step.title}
								</div>
							</div>
						))}
					</div>

					{/* Progress Bar for Desktop (connecting the steps) */}
					<div className="relative mt-5">
						<div className="absolute top-0 h-1 bg-gray-200 w-full"></div>
						<div
							className="absolute top-0 h-1 bg-blue-600 transition-all duration-500 ease-out"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>
			</div>
		);
	};

	if (isFetching) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
					<p className="mt-4 text-blue-600 font-medium">Loading form data...</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6 flex items-center">
				<Link
					to={id ? `/company-details/${id}` : "/"}
					className="text-gray-600 hover:text-gray-900 mr-4"
				>
					<ChevronLeft size={20} />
				</Link>
				<h1 className="text-2xl font-bold text-gray-800">
					{id ? "Update KYC Documents" : "Submit KYC Documents"}
				</h1>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fadeIn">
					<div className="flex items-center">
						<AlertCircle
							className="text-red-500 mr-3 flex-shrink-0"
							size={20}
						/>
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-fadeIn">
					<div className="flex items-center">
						<CheckCircle
							className="text-green-500 mr-3 flex-shrink-0"
							size={20}
						/>
						<p className="text-green-700">{success}</p>
					</div>
				</div>
			)}

			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
				<div className="flex items-start">
					<Info className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" size={24} />
					<div>
						<h2 className="text-lg font-semibold text-blue-800">
							How This Works
						</h2>
						<p className="text-blue-700 mt-1">
							Our AI-powered system analyzes your uploaded documents and
							extracts the necessary information to complete your KYC
							verification. For best results, please upload clear, legible
							documents.
							<span className="block mt-2">
								Fields marked with <span className="text-red-500">*</span> are
								required.
							</span>
						</p>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
				<StepIndicator currentStep={activeStep} totalSteps={totalSteps} />

				<form onSubmit={handleSubmit}>
					{/* Step 1: Company Information */}
					{activeStep === 1 && (
						<div className="space-y-8 animate-fadeIn">
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
									Company Names
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
									<FileUploadField
										name="intendedCompanyName"
										label="Intended Name Document"
										file={files.intendedCompanyName}
										preview={filePreview.intendedCompanyName}
									/>

									<FileUploadField
										name="alternativeCompanyName1"
										label="Alternative Name 1 Document"
										file={files.alternativeCompanyName1}
										preview={filePreview.alternativeCompanyName1}
									/>

									<FileUploadField
										name="alternativeCompanyName2"
										label="Alternative Name 2 Document"
										file={files.alternativeCompanyName2}
										preview={filePreview.alternativeCompanyName2}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Step 2: Activities and Address */}
					{activeStep === 2 && (
						<div className="space-y-8 animate-fadeIn">
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
									Company Activities & Address
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
									<FileUploadField
										name="companyActivities"
										label="Company Activities Document"
										file={files.companyActivities}
										preview={filePreview.companyActivities}
									/>

									<FileUploadField
										name="intendedRegisteredAddress"
										label="Address Verification Document"
										file={files.intendedRegisteredAddress}
										preview={filePreview.intendedRegisteredAddress}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Step 3: Financial and Constitution */}
					{activeStep === 3 && (
						<div className="space-y-8 animate-fadeIn">
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
									Financial Details & Constitution
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
									<FileUploadField
										name="financialYearEnd"
										label="Financial Year Document"
										file={files.financialYearEnd}
										preview={filePreview.financialYearEnd}
									/>

									<div>
										<div>
											<FileUploadField
												name="constitution"
												label="Constitution Document"
												file={files.constitution}
												preview={filePreview.constitution}
											/>
											<div>
												<select
													name="constitutionOption"
													value={formData.constitutionOption}
													onChange={handleInputChange}
													className="w-full mt-4 px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
												>
													<option value="">Select Constitution Option</option>
													<option value="1">Standard Constitution</option>
													<option value="2">Modified Constitution</option>
													<option value="3">Custom Constitution</option>
												</select>
												<p className="text-xs text-gray-500 mt-1">
													Select the constitution option that best fits your
													company structure
												</p>
											</div>
										</div>
									</div>

									{/* <div>
										<label className="block text-gray-700 font-medium mb-2">
											Constitution Option{" "}
											<span className="text-red-500">*</span>
										</label>
										<select
											name="constitutionOption"
											value={formData.constitutionOption}
											onChange={handleInputChange}
											className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
											required
										>
											<option value="">Select Constitution Option</option>
											<option value="1">Standard Constitution</option>
											<option value="2">Modified Constitution</option>
											<option value="3">Custom Constitution</option>
										</select>
										<p className="text-xs text-gray-500 mt-1">
											Select the constitution option that best fits your company
											structure
										</p>
									</div> */}
								</div>
							</div>
						</div>
					)}

					<div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
						{activeStep > 1 ? (
							<button
								type="button"
								onClick={prevStep}
								className="inline-flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
							>
								<ChevronLeft size={18} className="mr-2" /> Previous
							</button>
						) : (
							<Link
								to={id ? `/company-details/${id}` : "/"}
								className="inline-flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
							>
								<ChevronLeft size={18} className="mr-2" /> Cancel
							</Link>
						)}

						{activeStep < totalSteps ? (
							<button
								type="button"
								onClick={nextStep}
								className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition shadow-md"
							>
								Next <ArrowRight size={18} className="ml-2" />
							</button>
						) : (
							<button
								type="submit"
								disabled={isLoading}
								className={`inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition shadow-md ${
									isLoading ? "opacity-70 cursor-not-allowed" : ""
								}`}
							>
								{isLoading ? (
									<>
										<span className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
										{id ? "Updating..." : "Submitting..."}
									</>
								) : (
									<>
										<Save size={18} className="mr-2" />
										{id ? "Update Documents" : "Submit Documents"}
									</>
								)}
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default CompanyDetailsForm;
