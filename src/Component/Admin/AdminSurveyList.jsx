import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, X, UserCheck, Mail, Loader2, AlertCircle, ClipboardCheck } from 'lucide-react';
import api from '../../utils/api';

const AdminSurveyList = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['adminUserList'],
    queryFn: async () => {
      const response = await api.get('/api/user/user');
      return response?.data?.users || [];
    }
  });

  const { data: surveyDetails, isLoading: isSurveyLoading } = useQuery({
    queryKey: ['userSurvey', selectedUserId],
    queryFn: async () => {
      const response = await api.get(`/api/survey/getusersurveydata/${selectedUserId}`);
      return response?.data?.userData;
    },
    enabled: !!selectedUserId,
    retry: false
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => api.delete(`api/user/delete/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUserList']);
      alert('User deleted');
    }
  });

  if (isLoading) return <div className="h-64 flex flex-col items-center justify-center"><Loader2 className="animate-spin mb-2" size={32} /><p>Loading users...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">User Management</h2>
        <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl font-bold flex items-center gap-2">
          <UserCheck size={18}/> {userData?.length} Users
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">User</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Email</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {userData.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-700">{user.username}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setSelectedUserId(user._id)} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100">
                    <Eye size={16} /> Show Survey
                  </button>
                  <button onClick={() => window.confirm("Delete?") && deleteUserMutation.mutate(user._id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUserId(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black">User Survey Data</h3>
              <button onClick={() => setSelectedUserId(null)} className="p-2 bg-white rounded-full shadow-sm"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {isSurveyLoading ? <Loader2 className="animate-spin mx-auto" /> : 
               surveyDetails?.surveys?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {surveyDetails.surveys.map(s => (
                    <div key={s._id} className="border rounded-3xl p-6 bg-slate-50">
                      <p className="font-black text-blue-600 text-xs uppercase mb-4">{s.surveyKey}</p>
                      {s.answers.map((a, i) => (
                        <div key={i} className="mb-4">
                          <p className="text-xs font-bold text-slate-400">Q{i+1}: {a.questionText}</p>
                          <p className="text-sm font-bold text-slate-800">A: {a.answer}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-20 text-slate-400"><AlertCircle className="mx-auto mb-2" /> No surveys submitted.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSurveyList;