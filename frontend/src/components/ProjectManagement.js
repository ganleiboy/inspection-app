// frontend/src/components/ProjectManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function ProjectManagement({ token }) {
    // 存放查询到的所有点检项目
    const [items, setItems] = useState([]);
    // 用于创建新点检项目的表单数据
    const [newItem, setNewItem] = useState({
        category: "",
        step: "",
        check_item: "",
        standard: "",
        remark: ""
    });
    // 当前正在编辑的项目ID
    const [editingItem, setEditingItem] = useState(null);
    // 正在编辑时的表单数据
    const [editingData, setEditingData] = useState({
        category: "",
        step: "",
        check_item: "",
        standard: "",
        remark: ""
    });
    // 操作反馈信息
    const [message, setMessage] = useState("");

    // 获取全部点检项目
    const fetchItems = () => {
        axios.get("http://192.168.169.12:8000/inspection-items", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            setItems(res.data);
        })
        .catch((err) => {
            console.error(err);
        });
    };

    useEffect(() => {
        fetchItems();
    }, [token]);

    // 新建表单数据改变时触发
    const handleInputChangeNew = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    // 提交创建新点检项目的表单
    const handleCreateItem = (e) => {
        e.preventDefault();
        axios.post("http://192.168.169.12:8000/admin/inspection-items", newItem, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            setMessage("点检项目创建成功！");
            // 清空表单
            setNewItem({
                category: "",
                step: "",
                check_item: "",
                standard: "",
                remark: ""
            });
            fetchItems();
        })
        .catch((err) => {
            console.error(err);
            setMessage("点检项目创建失败");
        });
    };

    // 删除点检项目
    const handleDelete = (id) => {
        if (window.confirm("确定要删除该点检项目吗？")) {
            axios.delete(`http://192.168.169.12:8000/admin/inspection-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setMessage("点检项目删除成功！");
                fetchItems();
            })
            .catch((err) => {
                console.error(err);
                setMessage("删除失败");
            });
        }
    };

    // 开始编辑操作时，将当前项目数据复制到编辑表单中
    const startEditing = (item) => {
        setEditingItem(item.id);
        setEditingData({
            category: item.category,
            step: item.step,
            check_item: item.check_item,
            standard: item.standard,
            remark: item.remark || ""
        });
    };

    // 取消编辑
    const cancelEditing = () => {
        setEditingItem(null);
        setEditingData({
            category: "",
            step: "",
            check_item: "",
            standard: "",
            remark: ""
        });
    };

    // 编辑时表单数据改变
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingData(prev => ({ ...prev, [name]: value }));
    };

    // 提交编辑更新
    const submitEdit = (e, id) => {
        e.preventDefault();
        axios.put(`http://192.168.169.12:8000/admin/inspection-items/${id}`, editingData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            setMessage("点检项目更新成功！");
            setEditingItem(null);
            fetchItems();
        })
        .catch((err) => {
            console.error(err);
            setMessage("更新失败");
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">点检项目管理</h2>
            {message && <div className="mb-2 text-green-500">{message}</div>}
            <table className="min-w-full border mb-4">
                <thead>
                    <tr>
                        <th className="border px-2 py-1">ID</th>
                        <th className="border px-2 py-1">类别</th>
                        <th className="border px-2 py-1">步骤</th>
                        <th className="border px-2 py-1">检查项目</th>
                        <th className="border px-2 py-1">标准</th>
                        <th className="border px-2 py-1">备注</th>
                        <th className="border px-2 py-1">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="border px-2 py-1">{item.id}</td>
                            {editingItem === item.id ? (
                                <>
                                    <td className="border px-2 py-1">
                                        <input 
                                            type="text" 
                                            name="category" 
                                            value={editingData.category} 
                                            onChange={handleEditChange} 
                                            className="border rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input 
                                            type="text" 
                                            name="step" 
                                            value={editingData.step}
                                            onChange={handleEditChange} 
                                            className="border rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input 
                                            type="text" 
                                            name="check_item" 
                                            value={editingData.check_item} 
                                            onChange={handleEditChange} 
                                            className="border rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input 
                                            type="text" 
                                            name="standard" 
                                            value={editingData.standard} 
                                            onChange={handleEditChange} 
                                            className="border rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input 
                                            type="text" 
                                            name="remark" 
                                            value={editingData.remark} 
                                            onChange={handleEditChange} 
                                            className="border rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <button 
                                            onClick={(e) => submitEdit(e, item.id)} 
                                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            保存
                                        </button>
                                        <button 
                                            onClick={cancelEditing} 
                                            className="bg-gray-500 text-white px-2 py-1 rounded"
                                        >
                                            取消
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border px-2 py-1">{item.category}</td>
                                    <td className="border px-2 py-1">{item.step}</td>
                                    <td className="border px-2 py-1">{item.check_item}</td>
                                    <td className="border px-2 py-1">{item.standard}</td>
                                    <td className="border px-2 py-1">{item.remark}</td>
                                    <td className="border px-2 py-1">
                                        <button 
                                            onClick={() => startEditing(item)} 
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            编辑
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            删除
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3 className="text-lg font-bold mb-2">创建新点检项目</h3>
            <form onSubmit={handleCreateItem} className="space-y-2 mb-4">
                <div>
                    <label className="mr-2">类别: </label>
                    <input type="text" name="category" value={newItem.category} onChange={handleInputChangeNew} className="border px-2 py-1" required />
                </div>
                <div>
                    <label className="mr-2">步骤: </label>
                    <input type="text" name="step" value={newItem.step} onChange={handleInputChangeNew} className="border px-2 py-1" required />
                </div>
                <div>
                    <label className="mr-2">检查项目: </label>
                    <input type="text" name="check_item" value={newItem.check_item} onChange={handleInputChangeNew} className="border px-2 py-1" required />
                </div>
                <div>
                    <label className="mr-2">标准: </label>
                    <input type="text" name="standard" value={newItem.standard} onChange={handleInputChangeNew} className="border px-2 py-1" required />
                </div>
                <div>
                    <label className="mr-2">备注: </label>
                    <input type="text" name="remark" value={newItem.remark} onChange={handleInputChangeNew} className="border px-2 py-1" />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                    创建点检项目
                </button>
            </form>
        </div>
    );
}

export default ProjectManagement;