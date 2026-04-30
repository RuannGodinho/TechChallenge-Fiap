import { Peca } from '../../Entities/Estoque/Peca';
import { ObjectId } from 'mongodb';

export interface IPecaService {
  getAllPecas(): Promise<Peca[]>;
  getPecaById(id: ObjectId): Promise<Peca | null>;
  createPeca(pecaData: Omit<Peca, 'id'>): Promise<Peca>;
  updatePeca(id: ObjectId, pecaData: Partial<Peca>): Promise<Peca | null>;
  deletePeca(id: ObjectId): Promise<boolean>;
}
