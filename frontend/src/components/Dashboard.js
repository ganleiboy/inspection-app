import React, { useState, useEffect } from "react";
import axios from "axios";
import InspectionForm from "./InspectionForm";
import { Link, Routes, Route } from "react-router-dom";
import UserManagement from "./UserManagement";
import ProjectManagement from "./ProjectManagement";

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState("submit");
  const [inspectionItems, setInspectionItems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // 获取点检项目
  useEffect(() => {
    axios
      .get("http://192.168.169.12:8000/inspection-items", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setInspectionItems(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  // 完善权限验证逻辑：调用后端接口获取用户信息来判断权限
  useEffect(() => {
    if (token) {
      axios
        .get("http://192.168.169.12:8000/user-info", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          // 假设后端返回的数据中有 role 字段，值为 "admin" 时表示管理员
          if (res.data.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        })
        .catch((err) => {
          console.error(err);
          setIsAdmin(false);
        });
    }
  }, [token]);

  // 加载用户点检记录
  useEffect(() => {
    if (activeTab === "records") {
      axios
        .get("http://192.168.169.12:8000/my-inspections", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setSubmissions(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [activeTab, token]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">点检表系统</h1>
        <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded">登出</button>
      </div>
      <div className="mb-4">
        <button onClick={() => setActiveTab("submit")} className={`px-3 py-1 mr-2 ${activeTab === "submit" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>提交点检</button>
        <button onClick={() => setActiveTab("records")} className={`px-3 py-1 mr-2 ${activeTab === "records" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>我的点检记录</button>
        {isAdmin && (
          <button onClick={() => setActiveTab("admin")} className={`px-3 py-1 ${activeTab === "admin" ? "bg-blue-500 text-white" : "bg-gray-200"}`}> 管理面板</button>
        )}
      </div>
      {activeTab === "submit" && <InspectionForm token={token} inspectionItems={inspectionItems} />}
      {activeTab === "records" && (
        <div>
          <h2 className="text-xl mb-2">我的点检记录</h2>
          {submissions.length === 0 ? (
            <p>暂无记录</p>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="border p-2 mb-2">
                <div>日期: {sub.date}</div>
                <div>
                  {sub.details.map((detail, index) => (
                    <div key={index}>
                      检查项ID: {detail.inspection_item_id}, 结果: {detail.result}, 备注: {detail.remark}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === "admin" && (
        <div>
          <h2 className="text-xl mb-2">管理员管理面板</h2>
          {/* 管理面板里的导航链接 */}
          <div className="mb-4">
            <Link to="user-management" className="mr-4 text-blue-500 underline">用户管理</Link>
            <Link to="project-management" className="text-blue-500 underline">点检项目管理</Link>
          </div>
          {/* 嵌套路由显示对应的管理功能组件 */}
          <Routes>
            <Route path="user-management" element={<UserManagement token={token} />} />
            <Route path="project-management" element={<ProjectManagement token={token} />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default Dashboard;