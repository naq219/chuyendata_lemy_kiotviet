import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check } from 'lucide-react';

const API_URL = 'http://s1.vq.id.vn/p401/api/collections/chamcong/records';

const fixedTasks = [
  { id: 1, name: 'Kiểm tra email' },
  { id: 2, name: 'Cập nhật báo cáo' },
  { id: 3, name: 'Họp với khách hàng' },
  { id: 4, name: 'Xử lý đơn hàng' }
];

export default function TaskSalaryApp() {
  const [completedToday, setCompletedToday] = useState(false);
  const [extraTasks, setExtraTasks] = useState([]);
  const [newExtraTask, setNewExtraTask] = useState('');
  const [workdaysData, setWorkdaysData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all records from database
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setWorkdaysData(data.items || []);
      
      // Check if today is already completed
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = (data.items || []).find(item => {
        const createdDate = item.created.split(' ')[0];
        return createdDate === today;
      });
      setCompletedToday(!!todayRecord);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const saveTaskToDatabase = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const taskList = extraTasks.map(t => t.name).join(', ') || 'Công việc cố định';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          congviec: taskList,
          status: 'completed',
          date: today
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi lưu dữ liệu');
      }

      // Reset for new day
      setCompletedToday(true);
      setExtraTasks([]);
      setNewExtraTask('');
      
      // Refresh data
      await fetchRecords();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Lỗi lưu công việc: ' + err.message);
    }
  };

  const addExtraTask = () => {
    if (newExtraTask.trim()) {
      setExtraTasks([...extraTasks, { id: Date.now(), name: newExtraTask }]);
      setNewExtraTask('');
    }
  };

  const deleteExtraTask = (id) => {
    setExtraTasks(extraTasks.filter(task => task.id !== id));
  };

  const calculateWorkdays = () => {
    const today = new Date().toISOString().split('T')[0];
    return workdaysData.filter(item => {
      const createdDate = item.created.split(' ')[0];
      return createdDate <= today;
    }).length;
  };

  const workdays = calculateWorkdays();
  const salary = workdays * 500000;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Công việc Nhân viên</h1>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Ngày đã hoàn thành</p>
              <p className="text-2xl font-bold text-blue-600">{workdays}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Lương trong tháng</p>
              <p className="text-2xl font-bold text-green-600">{salary.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Mục tiêu (26 ngày)</p>
              <p className="text-2xl font-bold text-purple-600">13,000,000đ</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fixed Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Công việc cố định hàng ngày</h2>
            <div className="space-y-3">
              {fixedTasks.map(task => (
                <div key={task.id} className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <Check size={20} className="text-green-500" />
                  <span className="ml-3 font-medium text-gray-700">{task.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Công việc phát sinh hôm nay</h2>
            <div className="space-y-3 mb-4">
              {extraTasks.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Chưa có công việc phát sinh</p>
              ) : (
                extraTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <span className="text-gray-700">{task.name}</span>
                    <button
                      onClick={() => deleteExtraTask(task.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newExtraTask}
                onChange={(e) => setNewExtraTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExtraTask()}
                placeholder="Nhập công việc phát sinh..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addExtraTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Complete Day Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          {completedToday ? (
            <div className="text-center py-6">
              <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <p className="text-xl font-bold text-green-700">Hôm nay đã hoàn thành!</p>
              <p className="text-gray-600 mt-2">Công việc sẽ reset vào ngày mai</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 font-semibold">Xác nhận hoàn thành công việc hôm nay để cộng 500,000đ lương</p>
              <button
                onClick={saveTaskToDatabase}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Hoàn thành ngày hôm nay
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-700">Tiến độ tháng</p>
            <p className="text-sm text-gray-600">{workdays}/26 ngày</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(workdays / 26) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}