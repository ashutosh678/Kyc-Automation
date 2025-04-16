import React from 'react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: "Company Information" },
    { number: 2, title: "Activities & Address" },
    { number: 3, title: "Financial Details" }
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
              <div className={`
                mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${currentStep > step.number 
                  ? 'bg-blue-600 text-white' 
                  : currentStep === step.number
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                    : 'bg-gray-200 text-gray-600'}
              `}>
                {currentStep > step.number ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-700' : 'text-gray-500'}`}>
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

export default StepIndicator;