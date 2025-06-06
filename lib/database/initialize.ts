import { DatabaseConnection } from './connection';
import { User } from './entities/User';

async function initializeDatabase() {
  try {
    const connection = await DatabaseConnection.getInstance().connect();
    
    // Verificar si hay usuarios en la base de datos
    const userRepository = connection.getRepository(User);
    const userCount = await userRepository.count();
    
    if (userCount === 0) {
      // Crear un usuario de prueba
      const testUser = userRepository.create({
        name: 'Test User',
        email: 'test@example.com',
        isActive: true
      });
      
      await userRepository.save(testUser);
      console.log('Test user created successfully');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Ejecutar la inicialización si este archivo se ejecuta directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
