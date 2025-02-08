// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 使用 urlencoded 格式提交登录请求
    axios.post("http://192.168.169.12:8000/login", new URLSearchParams({
      username,
      password,
      grant_type: 'password'
    }), { headers: { "Content-Type": "application/x-www-form-urlencoded" }})
      .then(response => {
        onLogin(response.data.access_token);
      })
      .catch(err => {
        setError("登录失败，请检查用户名和密码");
        console.error(err);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">登录</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1">用户名</label>
          <input
            type="text"
            className="w-full border px-2 py-1 rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">密码</label>
          <input
            type="password"
            className="w-full border px-2 py-1 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">登录</button>
      </form>
    </div>
  );
}

export default Login;