import React from "react";
import AdminDashboard from "./AdminDashboard";
import AdminStats from "./AdminStats";

const App = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">设备点检管理系统</h1>
      <AdminDashboard />
      <AdminStats />
    </div>
  );
};

export default App;