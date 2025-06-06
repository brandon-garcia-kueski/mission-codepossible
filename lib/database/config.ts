import { DataSourceOptions } from 'typeorm';
import { sqliteConfig, ensureDatabaseDirectory } from './sqlite.config';

export const databaseConfig: DataSourceOptions = sqliteConfig;

export const getDatabaseConfig = (type: 'sqlite' | 'mysql' | 'postgres' = 'sqlite'): DataSourceOptions => {
  switch (type) {
    case 'sqlite':
      return databaseConfig;
    // Aquí puedes agregar más configuraciones para otros tipos de bases de datos
    default:
      return databaseConfig;
  }
};
