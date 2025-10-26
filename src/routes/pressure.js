import express from 'express';
import PressureModel from '../models/PressureModel.js';

const router = express.Router();

// ESP32 上传数据的接口
router.post('/data', async (req, res) => {
  try {
    const { sensor1, sensor2, timestamp } = req.body;

    // 验证数据
    if (sensor1 === undefined || sensor2 === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必需的参数 sensor1 或 sensor2' 
      });
    }

    // 关键修复: 确保 sensor2 (真空压强) 存储为负数
    // 如果 ESP32 发送的是正数,自动转为负数
    let processedSensor2 = parseFloat(sensor2);
    if (processedSensor2 > 0) {
      processedSensor2 = -processedSensor2;
    }

    // 保存到数据库
    const data = await PressureModel.create(
      parseFloat(sensor1), 
      processedSensor2, 
      timestamp ? new Date(timestamp) : null
    );

    res.json({ 
      success: true, 
      data: {
        id: data.id,
        sensor1: parseFloat(data.sensor1),
        sensor2: parseFloat(data.sensor2),
        timestamp: data.timestamp
      }
    });

  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '保存数据失败' 
    });
  }
});

// 获取指定时间范围的数据
router.get('/data', async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 60;

    const data = await PressureModel.getDataByTimeRange(minutes);

    // 转换数据格式,确保 sensor2 为负数
    const formattedData = data.map(item => ({
      id: item.id,
      sensor1: parseFloat(item.sensor1),
      sensor2: parseFloat(item.sensor2) > 0 ? -parseFloat(item.sensor2) : parseFloat(item.sensor2),
      timestamp: item.timestamp
    }));

    res.json({ 
      success: true, 
      data: formattedData,
      count: formattedData.length
    });

  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取数据失败' 
    });
  }
});

// 获取最新数据
router.get('/data/latest', async (req, res) => {
  try {
    const data = await PressureModel.getLatest();

    if (!data) {
      return res.json({ 
        success: true, 
        data: null 
      });
    }

    res.json({ 
      success: true, 
      data: {
        id: data.id,
        sensor1: parseFloat(data.sensor1),
        sensor2: parseFloat(data.sensor2) > 0 ? -parseFloat(data.sensor2) : parseFloat(data.sensor2),
        timestamp: data.timestamp
      }
    });

  } catch (error) {
    console.error('获取最新数据失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取最新数据失败' 
    });
  }
});

// 获取统计数据
router.get('/statistics', async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 60;

    const stats = await PressureModel.getStatistics(minutes);

    // 确保 sensor2 的统计数据为负数
    const sensor2Max = parseFloat(stats.sensor2_max);
    const sensor2Min = parseFloat(stats.sensor2_min);
    const sensor2Avg = parseFloat(stats.sensor2_avg);

    res.json({ 
      success: true, 
      data: {
        sensor1: {
          max: parseFloat(stats.sensor1_max) || 0,
          min: parseFloat(stats.sensor1_min) || 0,
          avg: parseFloat(stats.sensor1_avg) || 0
        },
        sensor2: {
          max: sensor2Max > 0 ? -sensor2Max : sensor2Max || 0,
          min: sensor2Min > 0 ? -sensor2Min : sensor2Min || 0,
          avg: sensor2Avg > 0 ? -sensor2Avg : sensor2Avg || 0
        },
        count: parseInt(stats.count)
      }
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取统计数据失败' 
    });
  }
});

export default router;