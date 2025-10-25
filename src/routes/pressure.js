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

    // 保存到数据库
    const data = await PressureModel.create(
      sensor1, 
      sensor2, 
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

    // 转换数据格式
    const formattedData = data.map(item => ({
      id: item.id,
      sensor1: parseFloat(item.sensor1),
      sensor2: parseFloat(item.sensor2),
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
        sensor2: parseFloat(data.sensor2),
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

    res.json({ 
      success: true, 
      data: {
        sensor1: {
          max: parseFloat(stats.sensor1_max) || 0,
          min: parseFloat(stats.sensor1_min) || 0,
          avg: parseFloat(stats.sensor1_avg) || 0
        },
        sensor2: {
          max: parseFloat(stats.sensor2_max) || 0,
          min: parseFloat(stats.sensor2_min) || 0,
          avg: parseFloat(stats.sensor2_avg) || 0
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
