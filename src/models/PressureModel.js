import pool from '../config/database.js';

class PressureModel {
  // 添加新的压强数据
  static async create(sensor1, sensor2, timestamp) {
    const query = `
      INSERT INTO pressure_data (sensor1, sensor2, timestamp)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [sensor1, sensor2, timestamp || new Date()];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 获取指定时间范围内的数据
  static async getDataByTimeRange(minutes) {
    const query = `
      SELECT id, sensor1, sensor2, timestamp
      FROM pressure_data
      WHERE timestamp >= NOW() - INTERVAL '${minutes} minutes'
      ORDER BY timestamp ASC;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // 获取最新的数据
  static async getLatest(limit = 1) {
    const query = `
      SELECT id, sensor1, sensor2, timestamp
      FROM pressure_data
      ORDER BY timestamp DESC
      LIMIT $1;
    `;
    
    const result = await pool.query(query, [limit]);
    return limit === 1 ? result.rows[0] : result.rows;
  }

  // 获取统计数据
  static async getStatistics(minutes) {
    const query = `
      SELECT 
        COUNT(*) as count,
        MAX(sensor1) as sensor1_max,
        MIN(sensor1) as sensor1_min,
        AVG(sensor1) as sensor1_avg,
        MAX(sensor2) as sensor2_max,
        MIN(sensor2) as sensor2_min,
        AVG(sensor2) as sensor2_avg
      FROM pressure_data
      WHERE timestamp >= NOW() - INTERVAL '${minutes} minutes';
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  // 删除旧数据（可选，用于清理）
  static async deleteOldData(days = 30) {
    const query = `
      DELETE FROM pressure_data
      WHERE timestamp < NOW() - INTERVAL '${days} days';
    `;
    
    const result = await pool.query(query);
    return result.rowCount;
  }
}

export default PressureModel;
