import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8000/users/");
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    const response = await fetch("http://localhost:8000/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword, is_admin: false }),
    });
    if (response.ok) {
      fetchUsers();
      setNewUsername("");
      setNewPassword("");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">用户管理</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="flex justify-between p-2 border-b">
            <span>{user.username} - {user.is_admin ? "管理员" : "普通用户"}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <input className="border p-2" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="用户名" />
        <input className="border p-2 ml-2" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="密码" />
        <button className="bg-green-500 text-white p-2 ml-2" onClick={addUser}>添加用户</button>
      </div>
    </div>
  );
};

export default AdminDashboard;