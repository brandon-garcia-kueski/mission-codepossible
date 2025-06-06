import { BaseRepository } from './base.repository';
import { User } from '../entities/User';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  // Aquí puedes agregar métodos específicos para User
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }
}
