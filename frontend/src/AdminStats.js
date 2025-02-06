import React from "react";

const AdminStats = () => {
  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-lg font-bold">统计信息</h2>
      <a href="http://localhost:8000/export/" className="bg-blue-500 text-white p-2 mt-4 inline-block">下载 Excel 报表</a>
    </div>
  );
};

export default AdminStats;