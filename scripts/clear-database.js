// Script để xóa tất cả dữ liệu trong database (chỉ dùng cho development)
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'recipe';

async function clearDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Đã kết nối MongoDB');
    
    const db = client.db(dbName);
    
    // Xóa tất cả collections
    await db.collection('users').deleteMany({});
    console.log('✅ Đã xóa tất cả users');
    
    await db.collection('meal_plans').deleteMany({});
    console.log('✅ Đã xóa tất cả meal_plans');
    
    await db.collection('shopping_lists').deleteMany({});
    console.log('✅ Đã xóa tất cả shopping_lists');
    
    console.log('\n🎉 Database đã được làm sạch!');
    console.log('Bạn có thể tạo tài khoản mới để test.');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

clearDatabase();
