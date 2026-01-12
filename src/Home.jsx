import React, { useReducer, useState } from 'react';
import SurveyHeader from './Component/SurveyHeader';
import SurveyMetaForm from './Component/HeaderMetaForm';
import ResponsiveVoterTable from './Component/ResponsiveVoterTable';
import { useMutation } from '@tanstack/react-query';
import api from './utils/api';
import DevelopmentSurvey from './Component/ResuableComponent/DevelopmentSurvey'; // Fix typo if needed to "ReusableComponent"
import { useAuth } from './Component/Context/ContextDataprovider';
import UserHeader from './Component/UserHeader';

const Home = () => {
  const { user } = useAuth();
  // Removed console.log(user) – avoid in production; use for debugging only.

  const initialState = {
    // Personal Info
     // Should be the ID of the logged-in user
    name: "",
    age: "", // Convert to Number on submit
    gender: "",
    wardNumber: "",
    address: "",
    date: "",
    time: "",
    // Background Info
    currentJob: "",
    familyNumber: "",
    phoneNumber: "",
    caste: "",
    class: "",
    religiousAffiliation: "",
    educationLevel: "",
    residencyStatus: "",
  };

  function reducerFun(state, action) {
    // Removed console.log(state)
    return {
      ...state,
      [action.field]: action.value,
    };
  }

  const [personalInfoState, dispatch] = useReducer(reducerFun, initialState);

  const surveyTemplate = {
    Survey1: {
      Topic: "विकाससँग सम्बन्धी प्रश्नावलीहरु",
      Subject: "क्षेत्रको समग्र अवस्था",
      questions: [
        {
          id: "q1",
          Question: "तपाईँको विचारमा अहिले यो क्षेत्रको मुख्य समस्या के हो?",
          options: [
            { type: "checkbox", option: "सडक" },
            { type: "checkbox", option: "पानी" },
            { type: "checkbox", option: "विजुली" },
            { type: "checkbox", option: "शिक्षा" },
            { type: "checkbox", option: "सिँचाई" },
            { type: "checkbox", option: "स्वास्थ्य" },
          ],
          answer: "", // String for single select
        },
        {
          id: "q2",
          Question: "पछिल्ला ५ वर्षमा क्षेत्रमा सुधार भयो कि बिग्रियो?",
          options: [
            { type: "checkbox", option: "सडक" },
            { type: "checkbox", option: "सुशासन" },
            { type: "checkbox", option: "विधि" },
            { type: "checkbox", option: "शिक्षा" },
            { type: "checkbox", option: "सामाजिक मेलमिलाप" },
            { type: "checkbox", option: "स्वास्थ्य" },
          ],
          answer: "",
        },
        {
          id: "q3",
          Question: "विकासका कामहरू कत्तिको सन्तोषजनक छन्?",
          options: [
            { type: "checkbox", option: "सन्तोषजनक नभएको" },
            { type: "checkbox", option: "ठिकै" },
            { type: "checkbox", option: "ठिक" },
            { type: "checkbox", option: "उत्तम" },
            { type: "checkbox", option: "उत्कृष्ट" },
          ],
          answer: "",
        },
        {
          id: "q4",
          Question: "स्थानीय सरकार÷प्रतिनिधि जनताप्रति कत्तिको जवाफदेही छन?",
          options: [
            { type: "checkbox", option: "छन्" },
            { type: "checkbox", option: "छैन" },
            { type: "checkbox", option: "मतलव छैन" },
          ],
          answer: "",
        },
      ],
    },
    Survey2: {
      Topic: "राजनीतिक शल्यक्रियाका प्रश्नहरु",
      Subject: "राजनीतिक विषयहरू", // Added for consistency; adjust if needed
      questions: [
        {
          id: "q1",
          Question: "माओवादी पार्टीको नेतृत्वमा साँढे दशबर्षे सम्म जनयुद्ध भएको थियो भन्ने बारे तपाइँलाई जानकारी छ ?",
          options: [
            { type: "checkbox", option: "छ" },
            { type: "checkbox", option: "छैन" },
          ],
          answer: "",
        },
        {
          id: "q2",
          Question: "आजको संघीय लोकतान्त्रिक गणतन्त्र, धर्मनिरपेक्षता, समानुपातिक समाबेशी प्रतिनिधित्व लगायतका उपलब्धिहरु ल्याउनमा तलका मध्ये कुन पार्टीको मुख्य भुमिका थियो ?",
          options: [
            { type: "checkbox", option: "माओवादी" },
            { type: "checkbox", option: "काँग्रेस" },
            { type: "checkbox", option: "एमाले" },
            { type: "checkbox", option: "राप्रपा" },
            { type: "checkbox", option: "माओवादी र सात दल" },
          ],
          answer: "",
        },
        {
          id: "q3",
          Question: "विकासका कामहरू कत्तिको सन्तोषजनक छन्?",
          options: [
            { type: "checkbox", option: "सन्तोषजनक नभएको" },
            { type: "checkbox", option: "ठिकै" },
            { type: "checkbox", option: "ठिक" },
            { type: "checkbox", option: "उत्तम" },
            { type: "checkbox", option: "उत्कृष्ट" },
          ],
          answer: "",
        },
        {
          id: "q4",
          Question: "तपाइँको बिचारमा भरतपुर—माडीको आजको बिकासमा तलको मध्ये कुन चाहीं दलको मुख्य भुमिका रहेको छ ?",
          options: [
            { type: "checkbox", option: "माओवादी" },
            { type: "checkbox", option: "कााग्रेस" },
            { type: "checkbox", option: "एमाले" },
            { type: "checkbox", option: "रास्वपा" },
            { type: "checkbox", option: "स्वतन्त्र व्यक्तिको" },
          ],
          answer: "",
        },
      ],
    },
  };

  const surveyReducer = (state, action) => {
    // Removed console.log(state)
    console.log(state)
    const { section, questionId, value, type } = action;

    const currentSection = state[section];

    const updatedQuestions = currentSection.questions.map((q) => {
      if (q.id === questionId) {
        if (type === 'checkbox') {
          // Single select: value is either the option string or "" (for deselect)
          return { ...q, answer: value };
        }
        // For text (if mixed)
        return { ...q, answer: value };
      }
      return q;
    });

    return {
      ...state,
      [section]: {
        ...currentSection,
        questions: updatedQuestions,
      },
    };
  };

  const [surveyState, surveyDispatch] = useReducer(surveyReducer, surveyTemplate);

  const [activeSurvey, setActiveSurvey] = useState('Survey1'); // For dropdown selection

  const sendData = useMutation({
    mutationFn: async (data) => {
      await api.post('/api/survey/createsurvey', { data });
    },
  });

const handleSubmit = () => {
  // We send the object directly. 
  // Most 'api' utilities (like Axios) automatically wrap this in a 'data' property in req.body
  const fullData = {
    personalInfo: personalInfoState,
    surveys: surveyState,
  };

  sendData.mutate(fullData);
};

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <UserHeader />
      <SurveyHeader />
      <SurveyMetaForm state={personalInfoState} dispatch={dispatch} />
      <ResponsiveVoterTable state={personalInfoState} dispatch={dispatch} />

      {/* Dropdown for Surveys – Replaces slider; scalable for more surveys */}
      <div className="max-w-4xl mx-auto my-6 bg-white p-4 rounded-lg shadow-md">
        <label htmlFor="survey-select" className="block text-lg font-medium text-gray-700 mb-2">
          Select Survey
        </label>
        <select
          id="survey-select"
          value={activeSurvey}
          onChange={(e) => setActiveSurvey(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg cursor-pointer hover:bg-gray-50"
        >
          {/* Hardcoded for two; for scalability, use: Object.keys(surveyState).map(key => <option key={key} value={key}>{key}</option>) */}
          <option value="Survey1">Survey 1: विकाससँग सम्बन्धी</option>
          <option value="Survey2">Survey 2: राजनीतिक शल्यक्रियाका</option>
        </select>
      </div>

      <DevelopmentSurvey 
        dispatch={surveyDispatch} 
        DevData={surveyState[activeSurvey]} 
        section={activeSurvey} 
      />

    <div className="max-w-4xl mx-auto mt-8 pb-10">
  <button 
    onClick={handleSubmit} 
    disabled={sendData.isPending}
    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2 ${
      sendData.isPending 
        ? "bg-gray-400 cursor-not-allowed" 
        : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
    }`}
  >
    {sendData.isPending ? (
      <>
        <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5"></span>
        Saving Survey...
      </>
    ) : (
      "Submit All Data"
    )}
  </button>

  {sendData.isError && (
    <p className="text-red-500 text-center mt-2 font-medium">
      Error: {sendData.error?.response?.data?.message || "Failed to save survey"}
    </p>
  )}
  {sendData.isSuccess && (
    <p className="text-green-600 text-center mt-2 font-medium">
      Survey saved successfully!
    </p>
  )}
</div>
    </div>
  );
};

export default Home;