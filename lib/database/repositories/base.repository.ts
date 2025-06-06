import { Repository, EntityTarget, DataSource, ObjectLiteral, DeepPartial } from 'typeorm';
import { DatabaseConnection } from '../connection';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(private entity: EntityTarget<T>) {
    const connection = DatabaseConnection.getInstance().getConnection();
    if (!connection) {
      throw new Error('Database connection not established');
    }
    this.repository = connection.getRepository(entity);
  }

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<T | null> {
    return await this.repository.findOneBy({ id } as any);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
