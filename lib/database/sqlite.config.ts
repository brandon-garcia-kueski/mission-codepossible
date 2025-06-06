import { DataSourceOptions } from 'typeorm';
import path from 'path';

// Configura la ruta de la base de datos SQLite
const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');

export const sqliteConfig: DataSourceOptions = {
  type: 'sqlite',
  database: dbPath,
  entities: [path.join(__dirname, 'entities', '*.{ts,js}')],
  synchronize: process.env.NODE_ENV !== 'production', // Solo sincronizar en desarrollo
  logging: process.env.NODE_ENV !== 'production',
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsRun: true,
};

// Función para asegurarse de que el directorio de la base de datos existe
export const ensureDatabaseDirectory = (): void => {
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};
