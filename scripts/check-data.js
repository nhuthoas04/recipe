// Script để kiểm tra dữ liệu trong MongoDB
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'recipe';

async function checkData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Đã kết nối MongoDB\n');
    
    const db = client.db(dbName);
    
    // Kiểm tra users
    const users = await db.collection('users').find({}).toArray();
    console.log('📊 Số lượng users:', users.length);
    if (users.length > 0) {
      console.log('User đầu tiên:', {
        id: users[0]._id.toString(),
        email: users[0].email,
        name: users[0].name,
      });
    }
    console.log('');
    
    // Kiểm tra meal_plans
    const mealPlans = await db.collection('meal_plans').find({}).toArray();
    console.log('📊 Số lượng meal plans:', mealPlans.length);
    
    if (mealPlans.length > 0) {
      const plan = mealPlans[0];
      console.log('\nMeal plan đầu tiên:');
      console.log('- ID:', plan.id || plan._id.toString());
      console.log('- Date:', plan.date);
      console.log('- UserID:', plan.userId);
      console.log('- Breakfast:', plan.breakfast?.length || 0, 'món');
      console.log('- Lunch:', plan.lunch?.length || 0, 'món');
      console.log('- Dinner:', plan.dinner?.length || 0, 'món');
      console.log('- Snack:', plan.snack?.length || 0, 'món');
      
      // Kiểm tra recipe đầu tiên
      if (plan.breakfast && plan.breakfast.length > 0) {
        const recipe = plan.breakfast[0];
        console.log('\n🍜 Recipe đầu tiên (breakfast):');
        console.log('- ID:', recipe.id);
        console.log('- Name:', recipe.name);
        console.log('- Category:', recipe.category);
        console.log('- PrepTime:', recipe.prepTime);
        console.log('- CookTime:', recipe.cookTime);
        console.log('- Tags:', recipe.tags);
        console.log('- Ingredients:', recipe.ingredients?.length);
        console.log('- Instructions:', recipe.instructions?.length);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

checkData();
