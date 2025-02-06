# inspection-app
一个基于 FastAPI + React + SQLite 的点检系统

@ganlei,20250206

inspection-app/
│── backend/                    # 后端 FastAPI 代码
│   │── database.py              # 数据库连接（SQLite）
│   │── main.py                  # FastAPI 入口
│   │── models.py                # 数据库模型
│   │── requirements.txt          # Python 依赖
│   └── data/                     # SQLite 数据库文件存储目录
│
│── frontend/                    # 前端 React 代码
│   │── package.json              # React 依赖配置  ✅ 放在这里
│   │── tailwind.config.js        # Tailwind CSS 配置  ✅ 放在这里
│   │── src/
│   │   ├── App.js                # 主组件
│   │   ├── AdminDashboard.js      # 管理员管理用户
│   │   ├── AdminStats.js          # 管理员查看统计数据
│   │   ├── index.js              # React 入口
│   │   ├── styles.css            # Tailwind CSS
│
│── docker-compose.yml           # Docker 配置
└── README.md                    # 使用说明