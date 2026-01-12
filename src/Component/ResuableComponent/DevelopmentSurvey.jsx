import React from 'react';

const DevelopmentSurvey = ({ DevData, dispatch, section }) => {
  const handleInputChange = (questionId, optionValue, type, e) => {
    // For checkbox: Toggle single select
    const newValue = e.target.checked ? optionValue : ''; // Set to option if checking, clear if unchecking
    dispatch({
      section,
      questionId,
      value: newValue,
      type,
    });
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 md:p-8 bg-white shadow-xl rounded-2xl border border-gray-200">
      {/* Header Section – Improved with gradient border */}
      <div className="border-b-4 border-gradient-to-r from-blue-500 to-blue-700 pb-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">{DevData?.Topic}</h1>
        <h2 className="text-lg md:text-xl text-blue-600 font-semibold">{DevData?.Subject}</h2>
      </div>

      <div className="space-y-8 md:space-y-10">
        {DevData?.questions.map((q) => (
          <div key={q.id} className="animate-fade-in">
            {/* Question Title – Better spacing and icon */}
            <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4 flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {q.id.replace('q', '')}
              </span>
              {q.Question}
            </h3>

            {/* Options Grid – Fully responsive: stack on mobile, 2-3 cols on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-0 sm:ml-11">
              {q.options.map((opt, index) => (
                <div key={index} className="flex flex-col">
                  {opt.type === "checkbox" ? (
                    <label 
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-blue-50 ${
                        q.answer === opt.option 
                          ? 'border-blue-500 bg-blue-50 shadow-inner' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                        checked={q.answer === opt.option}
                        onChange={(e) => handleInputChange(q.id, opt.option, 'checkbox', e)}
                      />
                      <span className="text-base md:text-lg font-medium text-gray-700">{opt.option}</span>
                    </label>
                  ) : (
                    // Textarea for 'other' – assuming you might add; kept for completeness
                    <div className="col-span-full mt-2">
                      <label className="text-sm font-bold text-gray-500 block mb-2">
                        {opt.option} (Other)
                      </label>
                      <textarea
                        placeholder={opt.placeholder || 'Enter details...'}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[100px] text-base md:text-lg"
                        value={q.answer || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value, 'text', e)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevelopmentSurvey;