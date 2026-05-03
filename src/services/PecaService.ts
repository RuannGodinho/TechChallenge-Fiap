import { Peca } from '../Entities/Estoque/Peca';
import { IPecaRepository } from '../Interfaces/Peca/IPecaRepository';
import { IPecaService } from '../Interfaces/Peca/IPecaService';
import { TipoItem } from '../validators/TipoItem';
import { ObjectId } from 'mongodb';

export class PecaService implements IPecaService {
  constructor(private repo: IPecaRepository) {}

  async getAllPecas(): Promise<Peca[]> {
    return await this.repo.getAllPecas();
  }

  async getPecaById(id: ObjectId): Promise<Peca | null> {
    return await this.repo.getPecaById(id);
  }

  async createPeca(pecaData: Omit<Peca, 'id'>): Promise<Peca> {
    const peca = new Peca(pecaData.nome, pecaData.descricao, pecaData.preco, pecaData.tipo);

    const tiposValidos = [TipoItem.PECA, TipoItem.INSUMO];

    if (!tiposValidos.includes(peca.tipo.toUpperCase() as any)) 
        throw new Error("Tipo inválido. Use PECA ou INSUMO");
    
    await this.repo.createPeca(peca);
    return peca;
  }

  async updatePeca(id: ObjectId, pecaData: Partial<Peca>): Promise<Peca | null> {
    const tiposValidos = [TipoItem.PECA, TipoItem.INSUMO];

    const existing = await this.repo.getPecaById(id);
    if (!existing) return null;

    const updated = { ...existing, ...pecaData };

    if (!tiposValidos.includes(updated.tipo.toUpperCase() as any)) 
        throw new Error("Tipo inválido. Use PECA ou INSUMO");

    await this.repo.updatePeca(id, updated);
    return updated;
  }

  async deletePeca(id: ObjectId): Promise<boolean> {
    const existing = await this.repo.getPecaById(id);
    if (!existing) return false;

    await this.repo.deletePeca(id);
    return true;
  }
}
