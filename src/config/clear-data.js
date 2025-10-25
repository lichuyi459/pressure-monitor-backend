import pool from './database.js';

async function clearData() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 开始清空数据...\n');

    // 查询清空前的记录数
    const beforeCount = await client.query('SELECT COUNT(*) FROM pressure_data');
    console.log(`📊 清空前记录数: ${beforeCount.rows[0].count}`);

    // 清空数据并重置ID序列
    await client.query('TRUNCATE TABLE pressure_data RESTART IDENTITY CASCADE;');

    // 查询清空后的记录数
    const afterCount = await client.query('SELECT COUNT(*) FROM pressure_data');
    console.log(`📊 清空后记录数: ${afterCount.rows[0].count}\n`);

    console.log('✅ 数据清空完成！');
    console.log('💡 提示: 下次插入的记录ID将从1开始\n');

  } catch (error) {
    console.error('❌ 清空数据失败:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 执行清空
clearData()
  .then(() => {
    console.log('✓ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ 脚本执行失败:', error);
    process.exit(1);
  });