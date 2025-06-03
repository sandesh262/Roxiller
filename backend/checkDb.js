const { sequelize } = require('./config/database');
const { Store } = require('./models');

async function checkDatabase() {
  try {
    // Test database connection
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Check tables
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:', tables.map(t => t.table_name));
    
    // Check if Stores table exists and has records
    try {
      const storeCount = await Store.count();
      console.log(`Number of stores in database: ${storeCount}`);
      
      if (storeCount > 0) {
        const stores = await Store.findAll({
          attributes: ['id', 'name', 'email']
        });
        console.log('Stores in database:');
        stores.forEach(store => {
          console.log(`- ID: ${store.id}, Name: ${store.name}, Email: ${store.email}`);
        });
      }
    } catch (storeError) {
      console.error('Error checking stores:', storeError);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the check
checkDatabase();
