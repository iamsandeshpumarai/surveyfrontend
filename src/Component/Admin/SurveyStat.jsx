import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import Loading from '../Loading/Loading';

// Mock data - replace with actual useQuery hook
const useSurveyData = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['surveydata'],
    queryFn: async () => {
      // 1. Added leading slash for consistent routing
      const response = await api.get('/api/survey/getsurvey');

      // 2. Axios wraps the backend response in a .data object
      return response.data.userData;
    },
    // Retries 3 times by default; set to false if you want immediate error reporting
    retry: 1,
  });
  

  // Log the actual data for debugging


  // If data is loading or errored, we return accordingly.
  // Otherwise, we return the API data.
  return {
    data: data || [], // Fallback to empty array to prevent .map errors
    isLoading,
    isError,
    error
  };
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const SurveyAnalyticsDashboard = () => {
  const { data: surveys, isLoading } = useSurveyData();

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [viewMode, setViewMode] = useState('bar'); // 'bar', 'pie', '
  
  // Get unique surveys
  const uniqueSurveys = useMemo(() => {
    if (!surveys) return [];
    const surveyMap = new Map();
    surveys.forEach(response => {
      response.surveys?.forEach(survey => {
        if (!surveyMap.has(survey.surveyKey)) {
          surveyMap.set(survey.surveyKey, {
            key: survey.surveyKey,
            topic: survey.topic,
            subject: survey.subject
          });
        }
      });
    });
    return Array.from(surveyMap.values());
  }, [surveys]);

  

  // Get questions for selected survey
  const questions = useMemo(() => {
    if (!selectedSurvey || !surveys) return [];
    const questionMap = new Map();

    surveys.forEach(response => {
      const survey = response.surveys?.find(s => s.surveyKey === selectedSurvey.key);
      survey?.answers?.forEach(ans => {
        if (!questionMap.has(ans.questionId)) {
          // Check if answer is an object (multi-part text question)
          // Multi-part = object with keys (text type questions)
          // Single = string (checkbox type questions)
          const isMultiPart = typeof ans.answer === 'object' &&
            ans.answer !== null &&
            !Array.isArray(ans.answer) &&
            Object.keys(ans.answer).length > 0;

          questionMap.set(ans.questionId, {
            id: ans.questionId,
            text: ans.questionText,
            isMultiPart: isMultiPart,
            subQuestions: isMultiPart ? Object.keys(ans.answer).filter(k => k !== '') : []
          });
        } else {
          // Update subQuestions if we find new ones
          const existing = questionMap.get(ans.questionId);
          if (existing.isMultiPart && typeof ans.answer === 'object' && ans.answer !== null) {
            const newSubQuestions = Object.keys(ans.answer).filter(k => k !== '');
            const mergedSubQuestions = [...new Set([...existing.subQuestions, ...newSubQuestions])];
            questionMap.set(ans.questionId, {
              ...existing,
              subQuestions: mergedSubQuestions
            });
          }
        }
      });
    });

    return Array.from(questionMap.values());
  }, [selectedSurvey, surveys]);

  console.log(questions, "questions for the selected survey")

  // Analyze answers for selected question
  const answerAnalysis = useMemo(() => {
    if (!selectedQuestion || !selectedSurvey || !surveys) return null;

    // For multi-part questions, analyze each sub-question separately
    if (selectedQuestion.isMultiPart) {
      const subQuestionAnalysis = {};

      selectedQuestion.subQuestions.forEach(subQ => {
        const answerCounts = new Map();
        const respondentsByAnswer = new Map();

        surveys.forEach(response => {
          const survey = response.surveys?.find(s => s.surveyKey === selectedSurvey.key);
          const answer = survey?.answers?.find(a => a.questionId === selectedQuestion.id);

          if (answer && typeof answer.answer === 'object') {
            const subAnswer = String(answer.answer[subQ] || '').trim();

            if (subAnswer) {
              answerCounts.set(subAnswer, (answerCounts.get(subAnswer) || 0) + 1);

              if (!respondentsByAnswer.has(subAnswer)) {
                respondentsByAnswer.set(subAnswer, []);
              }
              respondentsByAnswer.get(subAnswer).push({
                id: response._id,
                name: response.name,
                age: response.age,
                gender: response.gender,
                wardNumber: response.wardNumber,
                address: response.address,
                phoneNumber: response.phoneNumber,
                caste: response.caste,
                educationLevel: response.educationLevel
              });
            }
          }
        });

        // Sort by count and take top 7, group rest as "Other"
        const sortedAnswers = Array.from(answerCounts.entries())
          .sort((a, b) => b[1] - a[1]);

        const topAnswers = sortedAnswers.slice(0, 7);
        const otherAnswers = sortedAnswers.slice(7);

        let chartData = topAnswers.map(([answer, count]) => ({
          answer: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
          fullAnswer: answer,
          count,
          percentage: ((count / surveys.length) * 100).toFixed(1),
          isOther: false
        }));

        // Add "Other opinions" if there are more than 7 unique answers
        if (otherAnswers.length > 0) {
          const otherCount = otherAnswers.reduce((sum, [, count]) => sum + count, 0);
          const otherRespondents = new Map();

          otherAnswers.forEach(([answer]) => {
            otherRespondents.set(answer, respondentsByAnswer.get(answer));
          });

          chartData.push({
            answer: `Other opinions (${otherAnswers.length})`,
            fullAnswer: 'Other opinions',
            count: otherCount,
            percentage: ((otherCount / surveys.length) * 100).toFixed(1),
            isOther: true,
            otherAnswers: otherAnswers.map(([ans, cnt]) => ({
              answer: ans,
              count: cnt,
              respondents: respondentsByAnswer.get(ans)
            }))
          });
        }

        subQuestionAnalysis[subQ] = { chartData, respondentsByAnswer };
      });

      return { isMultiPart: true, subQuestionAnalysis };
    }

    

    // For single-choice questions (checkbox) - show all options
    const answerCounts = new Map();
    const respondentsByAnswer = new Map();

    surveys.forEach(response => {
      const survey = response.surveys?.find(s => s.surveyKey === selectedSurvey.key);
      const answer = survey?.answers?.find(a => a.questionId === selectedQuestion.id);

      if (answer) {
        const answerText = String(answer.answer).trim();

        if (answerText) {
          answerCounts.set(answerText, (answerCounts.get(answerText) || 0) + 1);

          if (!respondentsByAnswer.has(answerText)) {
            respondentsByAnswer.set(answerText, []);
          }
          respondentsByAnswer.get(answerText).push({
            id: response._id,
            name: response.name,
            age: response.age,
            gender: response.gender,
            wardNumber: response.wardNumber,
            address: response.address,
            phoneNumber: response.phoneNumber,
            caste: response.caste,
            educationLevel: response.educationLevel
          });
        }
      }
    });

    const chartData = Array.from(answerCounts.entries()).map(([answer, count]) => ({
      answer: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
      fullAnswer: answer,
      count,
      percentage: ((count / surveys.length) * 100).toFixed(1),
      isOther: false
    }));

    return { isMultiPart: false, chartData, respondentsByAnswer };
  }, [selectedQuestion, selectedSurvey, surveys]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Survey Analytics Dashboard</h1>

        {/* Survey and Question Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Survey Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Survey
              </label>
              <select
                value={selectedSurvey?.key || ''}
                onChange={(e) => {
                  const survey = uniqueSurveys.find(s => s.key === e.target.value);
                  setSelectedSurvey(survey);
                  setSelectedQuestion(null);
                  setSelectedAnswer(null);
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Choose a Survey --</option>
                {uniqueSurveys.map(survey => (
                  <option key={survey.key} value={survey.key}>
                    {survey.key} - {survey.topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Question
              </label>
              <select
                value={selectedQuestion?.id || ''}
                onChange={(e) => {
                  const question = questions.find(q => q.id === e.target.value);
                  setSelectedQuestion(question);
                  setSelectedAnswer(null);
                }}
                disabled={!selectedSurvey}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Choose a Question --</option>
                {questions.map(question => (
                  <option key={question.id} value={question.id}>
                    {question.text}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Answer Analysis */}
        {selectedQuestion && answerAnalysis && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis</h2>
              <p className="text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                {selectedQuestion.text}
              </p>
            </div>

            {/* Multi-part Question Analysis */}
            {answerAnalysis.isMultiPart ? (
              <div className="space-y-8">
                {Object.entries(answerAnalysis.subQuestionAnalysis).map(([subQuestion, analysis], idx) => (
                  <div key={idx} className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{subQuestion}</h3>

                    {/* View Mode Toggle for each sub-question */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setViewMode('bar')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm rounded ${viewMode === 'bar' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                          }`}
                      >
                        <BarChart3 className="w-3 h-3" />
                        Bar
                      </button>
                      <button
                        onClick={() => setViewMode('pie')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm rounded ${viewMode === 'pie' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                          }`}
                      >
                        📊 Pie
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                          }`}
                      >
                        📋 Table
                      </button>
                    </div>

                    {/* Visualization for sub-question */}
                    {viewMode === 'bar' && (
                      <ResponsiveContainer width="100%" height={Math.max(300, analysis.chartData.length * 60)}>
                        <BarChart data={analysis.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="answer" angle={-45} textAnchor="end" height={80} />
                          <YAxis
                            label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <Tooltip
                            formatter={(value) => [value.toLocaleString() + ' responses', 'Count']}
                          />
                          <Bar
                            dataKey="count"
                            fill="#3B82F6"
                            onClick={(data) => {
                              if (data.isOther) {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer,
                                  isOther: true,
                                  otherAnswers: data.otherAnswers
                                });
                              } else {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer
                                });
                              }
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {viewMode === 'pie' && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analysis.chartData}
                            dataKey="count"
                            nameKey="answer"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => `${entry.answer} (${entry.percentage}%)`}
                            onClick={(data) => {
                              if (data.isOther) {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer,
                                  isOther: true,
                                  otherAnswers: data.otherAnswers
                                });
                              } else {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer
                                });
                              }
                            }}
                          >
                            {analysis.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}

                    {viewMode === 'table' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">Answer</th>
                              <th className="border p-2 text-center">Count</th>
                              <th className="border p-2 text-center">Percentage</th>
                              <th className="border p-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.chartData.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border p-2">{item.fullAnswer}</td>
                                <td className="border p-2 text-center font-semibold">{item.count}</td>
                                <td className="border p-2 text-center">{item.percentage}%</td>
                                <td className="border p-2 text-center">
                                  <button
                                    onClick={() => {
                                      if (item.isOther) {
                                        setSelectedAnswer({
                                          answer: item.fullAnswer,
                                          subQuestion,
                                          respondents: analysis.respondentsByAnswer,
                                          isOther: true,
                                          otherAnswers: item.otherAnswers
                                        });
                                      } else {
                                        setSelectedAnswer({
                                          answer: item.fullAnswer,
                                          subQuestion,
                                          respondents: analysis.respondentsByAnswer
                                        });
                                      }
                                    }}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Single-choice Question Analysis */
              <>
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setViewMode('bar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${viewMode === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setViewMode('pie')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${viewMode === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    📊 Pie Chart
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    📋 Table
                  </button>
                </div>

                {viewMode === 'bar' && (
                  <ResponsiveContainer width="100%" height={Math.max(400, answerAnalysis.chartData.length * 70)}>
                    <BarChart data={answerAnalysis.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="answer" angle={-45} textAnchor="end" height={100} />
                      <YAxis
                        label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        formatter={(value) => [value.toLocaleString() + ' responses', 'Count']}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" onClick={(data) => setSelectedAnswer({ answer: data.fullAnswer, respondents: answerAnalysis.respondentsByAnswer })} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {viewMode === 'pie' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={answerAnalysis.chartData}
                        dataKey="count"
                        nameKey="answer"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => `${entry.answer} (${entry.percentage}%)`}
                        onClick={(data) => setSelectedAnswer({ answer: data.fullAnswer, respondents: answerAnalysis.respondentsByAnswer })}
                      >
                        {answerAnalysis.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {viewMode === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-left">Answer</th>
                          <th className="border p-3 text-center">Count</th>
                          <th className="border p-3 text-center">Percentage</th>
                          <th className="border p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {answerAnalysis.chartData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-3">{item.fullAnswer}</td>
                            <td className="border p-3 text-center font-semibold">{item.count}</td>
                            <td className="border p-3 text-center">{item.percentage}%</td>
                            <td className="border p-3 text-center">
                              <button
                                onClick={() => setSelectedAnswer({ answer: item.fullAnswer, respondents: answerAnalysis.respondentsByAnswer })}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Respondent Details Modal */}
            {selectedAnswer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[80vh] overflow-auto">
                  <div className="sticky top-0 bg-white border-b p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedAnswer.isOther ? 'All Other Opinions' : 'Respondents'}
                        </h3>
                        {selectedAnswer.subQuestion && (
                          <p className="text-sm text-gray-500 mt-1">Sub-question: {selectedAnswer.subQuestion}</p>
                        )}
                        {!selectedAnswer.isOther && (
                          <p className="text-sm text-gray-600 mt-1">Answer: <span className="font-medium">{selectedAnswer.answer}</span></p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedAnswer(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {selectedAnswer.isOther ? (
                      /* Show all other opinions grouped */
                      <div className="space-y-4">
                        {selectedAnswer.otherAnswers.map((other, idx) => (
                          <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-gray-800">"{other.answer}"</h4>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {other.count} {other.count === 1 ? 'person' : 'people'}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border p-2 text-left text-sm">Name</th>
                                    <th className="border p-2 text-left text-sm">Age</th>
                                    <th className="border p-2 text-left text-sm">Gender</th>
                                    <th className="border p-2 text-left text-sm">Ward</th>
                                    <th className="border p-2 text-left text-sm">Phone</th>
                                    <th className="border p-2 text-left text-sm">Caste</th>
                                    <th className="border p-2 text-left text-sm">Education</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {other.respondents?.map((respondent, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-gray-50">
                                      <td className="border p-2 text-sm">{respondent.name}</td>
                                      <td className="border p-2 text-sm">{respondent.age}</td>
                                      <td className="border p-2 text-sm">{respondent.gender}</td>
                                      <td className="border p-2 text-sm">{respondent.wardNumber}</td>
                                      <td className="border p-2 text-sm">{respondent.phoneNumber}</td>
                                      <td className="border p-2 text-sm">{respondent.caste}</td>
                                      <td className="border p-2 text-sm">{respondent.educationLevel}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Show single answer respondents */
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Name</th>
                            <th className="border p-2 text-left">Age</th>
                            <th className="border p-2 text-left">Gender</th>
                            <th className="border p-2 text-left">Ward</th>
                            <th className="border p-2 text-left">Phone</th>
                            <th className="border p-2 text-left">Caste</th>
                            <th className="border p-2 text-left">Education</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAnswer.respondents.get(selectedAnswer.answer)?.map((respondent, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border p-2">{respondent.name}</td>
                              <td className="border p-2">{respondent.age}</td>
                              <td className="border p-2">{respondent.gender}</td>
                              <td className="border p-2">{respondent.wardNumber}</td>
                              <td className="border p-2">{respondent.phoneNumber}</td>
                              <td className="border p-2">{respondent.caste}</td>
                              <td className="border p-2">{respondent.educationLevel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyAnalyticsDashboard;