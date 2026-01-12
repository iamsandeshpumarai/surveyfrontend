import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import UserHeader from './UserHeader';
import { 
  User, MapPin, Calendar, Briefcase, Phone, 
  ClipboardList, AlertCircle, Loader2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MySurveys = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['mySurveyData'],
    queryFn: async () => {
      const response = await api.get('/api/survey/getsurvey');
      // Adjust this based on your API response structure
      return response.data.userData; 
    },
  });

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">डाटा लोड हुँदैछ...</p>
        </div>
      </div>
    );
  }

  // 2. ERROR / EMPTY STATE (फारम भरिएको छैन)
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <UserHeader />
        <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">तपाईँको फारम भरिएको छैन</h2>
          <p className="text-slate-500 mb-8">
            तपाईँले अहिलेसम्म कुनै पनि सर्वेक्षण फारम भर्नुभएको छैन। कृपया सर्वेक्षण पुरा गर्नुहोस्।
          </p>
          <Link 
            to="/userdashboard" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <ClipboardList size={18} />
            फारम भर्नुहोस्
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <UserHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TOP SECTION: User Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{data.name}</h1>
                <p className="text-slate-500 flex items-center gap-1 font-medium">
                  ID: {data.userId?.slice(-6).toUpperCase()} • {data.date}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
              <QuickInfo label="वार्ड" value={data.wardNumber} icon={<MapPin size={14}/>} />
              <QuickInfo label="उमेर" value={data.age} icon={<Calendar size={14}/>} />
              <QuickInfo label="पेशा" value={data.currentJob} icon={<Briefcase size={14}/>} />
              <QuickInfo label="फोन" value={data.phoneNumber} icon={<Phone size={14}/>} />
            </div>
          </div>
        </div>

        {/* SURVEYS GRID (Survey 1, 2, 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.surveys.map((survey, sIdx) => (
            <div key={survey._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Survey Header */}
              <div className="bg-slate-900 p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {sIdx + 1}
                   </div>
                   <h3 className="text-white font-bold tracking-wide">
                     {survey.surveyKey === 'Survey1' ? 'विकास सम्बन्धी' : 'राजनीतिक शल्यक्रिया'}
                   </h3>
                </div>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded uppercase font-bold">
                  Ver {survey.surveyVersion}
                </span>
              </div>

              {/* Answers List */}
              <div className="p-2 flex-1">
                {survey.answers.map((item, index) => (
                  <div key={item._id} className="p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                          प्रश्न {index + 1}
                        </p>
                        <h4 className="text-slate-800 font-medium leading-relaxed mb-3">
                          {item.questionText}
                        </h4>
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
                          <span className="text-xs font-bold">उत्तर:</span>
                          <span className="font-bold">{item.answer || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Helper component for the user info header
const QuickInfo = ({ label, value, icon }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
      {icon} {label}
    </span>
    <span className="text-slate-700 font-bold text-sm truncate max-w-[100px]">{value || 'N/A'}</span>
  </div>
);

export default MySurveys;