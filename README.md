# 压强监控后端 API

物理实验压强数据监控系统后端服务

## 📋 功能特性

- ✅ 接收 ESP32 上传的压强数据
- ✅ 存储数据到 PostgreSQL 数据库
- ✅ 提供数据查询 API
- ✅ 提供统计数据 API
- ✅ 支持时间范围筛选

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pressure_monitor
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
```

### 3. 初始化数据库

确保 PostgreSQL 已安装并运行，然后创建数据库：

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE pressure_monitor;

# 退出
\q
```

运行初始化脚本：

```bash
npm run init-db
```

### 4. 启动服务器

开发模式（自动重启）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

服务器将在 http://localhost:3000 启动

## 📡 API 接口文档

### 1. 上传压强数据（ESP32 使用）

**接口**: `POST /api/pressure/data`

**请求体**:
```json
{
  "sensor1": 101325,
  "sensor2": -15000,
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sensor1": 101325,
    "sensor2": -15000,
    "timestamp": "2025-10-23T10:30:00.000Z"
  }
}
```

### 2. 获取历史数据

**接口**: `GET /api/pressure/data?minutes=60`

**参数**:
- `minutes`: 时间范围（分钟），默认 60

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sensor1": 101325,
      "sensor2": -15000,
      "timestamp": "2025-10-23T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 3. 获取最新数据

**接口**: `GET /api/pressure/data/latest`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sensor1": 101325,
    "sensor2": -15000,
    "timestamp": "2025-10-23T10:30:00.000Z"
  }
}
```

### 4. 获取统计数据

**接口**: `GET /api/pressure/statistics?minutes=60`

**参数**:
- `minutes`: 时间范围（分钟），默认 60

**响应**:
```json
{
  "success": true,
  "data": {
    "sensor1": {
      "max": 101330,
      "min": 101315,
      "avg": 101322.5
    },
    "sensor2": {
      "max": -5000,
      "min": -20000,
      "avg": -12500
    },
    "count": 6
  }
}
```

### 5. 健康检查

**接口**: `GET /health`

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T10:30:00.000Z",
  "uptime": 123.456
}
```

## 🔧 ESP32 示例代码

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";
const char* serverUrl = "http://your-server-ip:3000/api/pressure/data";

void sendData(float sensor1, float sensor2) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  String jsonData = "{\"sensor1\":" + String(sensor1) + 
                    ",\"sensor2\":" + String(sensor2) + "}";
  
  int httpCode = http.POST(jsonData);
  
  if (httpCode > 0) {
    Serial.println("数据上传成功");
  } else {
    Serial.println("数据上传失败");
  }
  
  http.end();
}
```

## 📊 数据库结构

### pressure_data 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| sensor1 | NUMERIC(10,2) | 环境压强 (Pa) |
| sensor2 | NUMERIC(10,2) | 真空压强 (Pa) |
| timestamp | TIMESTAMP | 数据时间戳 |
| created_at | TIMESTAMP | 记录创建时间 |

## 📝 注意事项

1. 确保 PostgreSQL 数据库正常运行
2. 修改 `.env` 文件中的数据库连接信息
3. ESP32 需要能够访问后端服务器的网络地址
4. 数据永久保存，建议定期清理旧数据
