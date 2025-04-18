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
			fetchExistingDetails();
		}
	}, [id]);

	const fetchExistingDetails = async () => {
		try {
			setIsFetching(true);
			const response = await companyService.getCompanyDetails();

			if (response.success && response.data) {
				// Populate form data
				setFormData({
					constitutionOption:
						response.data.constitution?.option?.toString() || "",
					// ... other form data
				});

				// Set file previews
				setFilePreview({
					constitution: response.data.constitution?.fileId?.fileUrl || null,
					intendedCompanyName:
						response.data.intendedCompanyName?.fileId?.fileUrl || null,
					// ... other file previews
				});
			}
		} catch (error) {
			console.error("Error fetching company details:", error);
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

		const formPayload = new FormData();

		// Add files
		Object.entries(files).forEach(([key, file]) => {
			if (file) {
				formPayload.append(key, file);
			}
		});

		// Append the selected constitution option
		if (files.constitution) {
			formPayload.append("option", formData.constitutionOption);
		}

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

			// Update navigation to always go to /company-details
			setTimeout(() => {
				navigate("/company-details");
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
			<div className="mb-6">
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

				{/* Only show constitution option select when constitution file is uploaded */}
				{name === "constitution" && (file || preview) && (
					<div className="mt-4">
						<select
							name="constitutionOption"
							value={formData.constitutionOption}
							onChange={handleInputChange}
							className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="">Select Constitution Type</option>
							<option value="1">Standard Constitution</option>
							<option value="2">Modified Constitution</option>
							<option value="3">Custom Constitution</option>
						</select>
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

	// Step 3 content with no form wrapping
	const renderStep3 = () => {
		return (
			<div>
				<h2 className="text-xl font-semibold mb-4">Constitution Details</h2>
				<div className="space-y-6">
					<FileUploadField
						name="constitution"
						label="Constitution Document"
						file={files.constitution}
						preview={filePreview.constitution}
					/>

					{/* Separate constitution option select */}
					{(files.constitution || filePreview.constitution) && (
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Constitution Type
							</label>
							<select
								name="constitutionOption"
								value={formData.constitutionOption}
								onChange={(e) => {
									e.preventDefault();
									setFormData((prev) => ({
										...prev,
										constitutionOption: e.target.value,
									}));
								}}
								className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Select Constitution Type</option>
								<option value="1">Standard Constitution</option>
								<option value="2">Modified Constitution</option>
								<option value="3">Custom Constitution</option>
							</select>
						</div>
					)}
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
		<div className="max-w-4xl mx-auto p-6">
			{/* Progress bar */}
			<div className="mb-8">
				{renderStepIndicator({ currentStep: activeStep, totalSteps })}
			</div>

			{/* Messages */}
			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-600">{error}</p>
				</div>
			)}

			{success && (
				<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-green-600">{success}</p>
				</div>
			)}

			{/* Content */}
			<div className="bg-white rounded-lg shadow-md p-6">
				{/* Step content */}
				<div className="mb-6">
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

					{activeStep === 3 && renderStep3()}
				</div>

				{/* Navigation buttons - Completely separated from form */}
				<div className="flex justify-between mt-6">
					{activeStep > 1 && (
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								prevStep();
							}}
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
						>
							Previous
						</button>
					)}

					<div className="ml-auto">
						{activeStep < totalSteps && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									nextStep();
								}}
								className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							>
								Next
							</button>
						)}

						{activeStep === totalSteps && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									handleSubmit(e);
								}}
								disabled={isLoading}
								className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
							>
								{isLoading ? "Submitting..." : "Submit"}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CompanyDetailsForm;
