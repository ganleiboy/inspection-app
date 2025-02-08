// frontend/src/components/UserManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function UserManagement({ token }) {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: "", password: "", role: "" });
    const [message, setMessage] = useState("");

    // 获取用户列表
    useEffect(() => {
        axios
            .get("http://192.168.169.12:8000/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [token]);

    // 表单输入变化时更新 newUser 对象
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    // 提交表单创建新用户
    const handleCreateUser = (e) => {
        e.preventDefault();
        // 转换 role 为布尔值：如果输入 "admin" 则为管理员
        const payload = {
            username: newUser.username,
            password: newUser.password,
            is_admin: newUser.role === "admin"
        };
        axios
            .post("http://192.168.169.12:8000/admin/users", payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setMessage("用户创建成功！");
                // 重新获取用户列表
                return axios.get("http://192.168.169.12:8000/admin/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });
            })
            .then((res2) => {
                setUsers(res2.data);
                // 清空表单
                setNewUser({ username: "", password: "", role: "" });
            })
            .catch((err) => {
                console.error(err);
                setMessage("用户创建失败");
            });
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">用户管理</h2>
            {message && <div className="mb-2 text-green-500">{message}</div>}
            <table className="min-w-full border mb-4">
                <thead>
                    <tr>
                        <th className="border px-2 py-1">ID</th>
                        <th className="border px-2 py-1">用户名</th>
                        <th className="border px-2 py-1">角色</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="border px-2 py-1">{user.id}</td>
                            <td className="border px-2 py-1">{user.username}</td>
                            <td className="border px-2 py-1">{user.is_admin ? "admin" : "user"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3 className="text-lg font-bold mb-2">创建新用户</h3>
            <form onSubmit={handleCreateUser} className="space-y-2">
                <div>
                    <label className="mr-2">用户名: </label>
                    <input type="text" name="username" value={newUser.username} onChange={handleInputChange} className="border px-2 py-1" required />
                </div>
                <div>
                    <label className="mr-2">密码: </label>
                    <input type="password" name="password" value={newUser.password} onChange={handleInputChange} className="border px-2 py-1" required />
                </div>
                <div>
                    <label className="mr-2">角色: </label>
                    <input type="text" name="role" value={newUser.role} onChange={handleInputChange} className="border px-2 py-1" placeholder="例如 admin 或 user" required />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                    创建用户
                </button>
            </form>
        </div>
    );
}

export default UserManagement;