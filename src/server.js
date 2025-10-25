import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { networkInterfaces } from 'os';
import pressureRoutes from './routes/pressure.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - 增强的 CORS 配置以支持局域网访问
app.use(cors({
  origin: '*', // 允许所有来源（生产环境建议指定具体域名）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/pressure', pressureRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: '接口不存在' 
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    success: false, 
    error: '服务器内部错误' 
  });
});

// 获取本机局域网 IP 地址
function getLocalIP() {
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // 跳过内部（即非 IPv4 或不是 127.0.0.1）地址
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// 启动服务器 - 监听所有网络接口（0.0.0.0）
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`
  🚀 压强监控后端服务已启动
  📡 监听端口: ${PORT}
  
  🌐 本地访问:
     http://localhost:${PORT}
     http://127.0.0.1:${PORT}
  
  📱 局域网访问:
     http://${localIP}:${PORT}
  
  📊 健康检查:
     http://${localIP}:${PORT}/health
  
  💡 ESP32 配置:
     服务器地址: http://${localIP}:${PORT}/api/pressure/data
  `);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});