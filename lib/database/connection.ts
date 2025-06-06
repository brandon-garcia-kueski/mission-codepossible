import { DataSource, DataSourceOptions } from 'typeorm';
import { getDatabaseConfig } from './config';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: DataSource | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(config: DataSourceOptions = getDatabaseConfig()): Promise<DataSource> {
    if (!this.connection) {
      // Asegurarse de que el directorio de la base de datos existe
      const { ensureDatabaseDirectory } = require('./sqlite.config');
      ensureDatabaseDirectory();
      
      this.connection = new DataSource(config);
      await this.connection.initialize();
      console.log('SQLite database connection established');
    }
    return this.connection;
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.destroy();
      this.connection = null;
      console.log('Database connection closed');
    }
  }

  public getConnection(): DataSource | null {
    return this.connection;
  }
}
