// MongoDB initialization script
db = db.getSiblingDB('recipe');

// Create admin user in recipe database
db.createUser({
  user: 'recipeuser',
  pwd: 'recipepassword',
  roles: [
    {
      role: 'readWrite',
      db: 'recipe'
    }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('recipes');
db.createCollection('meal_plans');
db.createCollection('shopping_lists');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.recipes.createIndex({ name: 1 });
db.recipes.createIndex({ status: 1 });
db.recipes.createIndex({ authorEmail: 1 });
db.meal_plans.createIndex({ userId: 1, date: 1 });
db.shopping_lists.createIndex({ userId: 1 });

print('MongoDB initialized successfully!');
