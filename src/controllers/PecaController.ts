import { Peca } from '../Entities/Estoque/Peca';
import { IPecaService } from '../Interfaces/Peca/IPecaService';
import { ObjectId } from 'mongodb';

export class PecaController {
  constructor(private service: IPecaService) {}

  async getAllPecas(): Promise<Peca[]> {
    return await this.service.getAllPecas();
  }

  async getPecaById(id: string): Promise<Peca | null> {
    return await this.service.getPecaById(new ObjectId(id));
  }

  async createPeca(pecaData: Omit<Peca, 'id'>): Promise<Peca> {
    return await this.service.createPeca(pecaData);
  }

  async updatePeca(id: string, pecaData: Partial<Peca>): Promise<Peca | null> {
    return await this.service.updatePeca(new ObjectId(id), pecaData);
  }

  async deletePeca(id: string): Promise<boolean> {
    return await this.service.deletePeca(new ObjectId(id));
  }
}
