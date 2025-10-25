import pool from './database.js';

const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('📦 开始初始化数据库...');

    // 创建压强数据表
    await client.query(`
      CREATE TABLE IF NOT EXISTS pressure_data (
        id SERIAL PRIMARY KEY,
        sensor1 NUMERIC(10, 2) NOT NULL,
        sensor2 NUMERIC(10, 2) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 创建 pressure_data 表成功');

    // 创建索引以提高查询性能
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pressure_timestamp 
      ON pressure_data(timestamp DESC);
    `);

    console.log('✅ 创建索引成功');

    // 插入一些测试数据
    await client.query(`
      INSERT INTO pressure_data (sensor1, sensor2, timestamp)
      VALUES 
        (101325, -5000, NOW() - INTERVAL '5 minutes'),
        (101330, -8000, NOW() - INTERVAL '4 minutes'),
        (101320, -12000, NOW() - INTERVAL '3 minutes'),
        (101315, -15000, NOW() - INTERVAL '2 minutes'),
        (101325, -18000, NOW() - INTERVAL '1 minute'),
        (101330, -20000, NOW());
    `);

    console.log('✅ 插入测试数据成功');
    console.log('🎉 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// 执行初始化
initDatabase().catch(console.error);
