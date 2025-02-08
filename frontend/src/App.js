import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  // 从 localStorage 中读取保存的 token，如果没有则为空字符串
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // 当 token 发生变化时，通过 useEffect 自动更新 axios 的默认请求头
  useEffect(() => {
    if (token) {
      // 当 token 存在时，在请求头中加入 Bearer 认证信息
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      // 如果没有 token，则删除 Authorization 请求头
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 登录成功后调用该函数，将 token 保存到状态和 localStorage，并设置 axios 的默认头
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${ newToken }`;
  };

  // 登出时清除 token 信息和 axios 默认头
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <div className="min-h-screen">
      {!token ? (
        // 如果没有 token，则渲染登录组件，并将 handleLogin 函数传递进去
        <Login onLogin={handleLogin} />
      ) : (
        // 如果存在 token，则渲染主面板组件，并把 token 和 handleLogout 传递进去
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;