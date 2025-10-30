// Script để tạo tài khoản admin
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://localhost:27017';
const dbName = 'recipe';

async function createAdminAccount() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Đã kết nối MongoDB\n');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await usersCollection.findOne({ email: 'admin@recipe.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Tài khoản admin đã tồn tại!');
      console.log('Email: admin@recipe.com');
      console.log('ID:', existingAdmin._id.toString());
      return;
    }
    
    // Tạo tài khoản admin mới
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await usersCollection.insertOne({
      email: 'admin@recipe.com',
      password: hashedPassword,
      name: 'Administrator',
      createdAt: new Date(),
    });
    
    console.log('✅ Đã tạo tài khoản admin!');
    console.log('\n📧 Thông tin đăng nhập:');
    console.log('   Email: admin@recipe.com');
    console.log('   Password: admin123');
    console.log('\n🔗 Truy cập: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

createAdminAccount();
