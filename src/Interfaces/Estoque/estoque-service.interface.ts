import { Estoque } from '../../Entities/Estoque/Estoque';
import { MovimentacaoEstoque } from '../../Entities/Estoque/MovimentacaoEstoque';
import { ObjectId } from "mongodb";

export interface IEstoqueService {
  getAllEstoque(): Promise<Estoque[]>;
  createMovimentacao(movimentacao: MovimentacaoEstoque): Promise<MovimentacaoEstoque>;
  listaMovimentacoes(): Promise<MovimentacaoEstoque[]>;
  getEstoqueByPecaId(pecaId: ObjectId): Promise<Estoque | null>;
  createEstoque(estoqueData: Omit<Estoque, 'id'>): Promise<Estoque>;
  updateEstoque(pecaId: ObjectId, quantidade: number): Promise<Estoque | null>;
  deleteEstoque(pecaId: ObjectId): Promise<boolean>;
}
