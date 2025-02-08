// frontend/src/components/InspectionForm.js
import React, { useState } from 'react';
import axios from 'axios';

function InspectionForm({ token, inspectionItems }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState({});
  const [message, setMessage] = useState("");

  const handleResultChange = (itemId, field, value) => {
    setResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const details = inspectionItems.map(item => {
      const resultEntry = results[item.id] || {};
      return {
        inspection_item_id: item.id,
        result: resultEntry.result || "",
        remark: resultEntry.remark || ""
      }
    });
    axios.post("http://192.168.169.12:8000/submit-inspection", {
      date: date,
      details: details
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setMessage("提交成功");
    }).catch(err => {
      console.error(err);
      setMessage("提交失败");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mr-2">日期:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border px-2 py-1 rounded"/>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">类别</th>
              <th className="border px-2 py-1">步骤</th>
              <th className="border px-2 py-1">检查项目</th>
              <th className="border px-2 py-1">标准</th>
              <th className="border px-2 py-1">结果</th>
              <th className="border px-2 py-1">备注</th>
            </tr>
          </thead>
          <tbody>
            {inspectionItems.map(item => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{item.category}</td>
                <td className="border px-2 py-1">{item.step}</td>
                <td className="border px-2 py-1">{item.check_item}</td>
                <td className="border px-2 py-1">{item.standard}</td>
                <td className="border px-2 py-1">
                  <select value={(results[item.id] && results[item.id].result) || ""} onChange={(e) => handleResultChange(item.id, "result", e.target.value)} className="border rounded">
                    <option value="">选择</option>
                    <option value="合格">合格</option>
                    <option value="不合格">不合格</option>
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <input type="text" value={(results[item.id] && results[item.id].remark) || ""} 
                    onChange={(e) => handleResultChange(item.id, "remark", e.target.value)} className="border rounded px-2 py-1"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">提交点检表</button>
      </div>
      {message && <div className="mt-2 text-blue-500">{message}</div>}
    </form>
  );
}

export default InspectionForm;