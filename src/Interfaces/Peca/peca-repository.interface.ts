import { ObjectId } from 'mongodb';
import { Peca } from '../../Entities/Estoque/peca';

export interface IPecaRepository {
  getAllPecas(): Promise<Peca[]>;
  getPecaById(id: ObjectId): Promise<Peca | null>;
  createPeca(peca: Peca): Promise<void>;
  updatePeca(id: ObjectId, peca: Peca): Promise<void>;
  deletePeca(id: ObjectId): Promise<void>;
}
