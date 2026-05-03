import { Estoque } from '../Entities/Estoque/Estoque';
import { IEstoqueRepository } from '../Interfaces/Estoque/IEstoqueRepository';
import { IEstoqueService } from '../Interfaces/Estoque/IEstoqueService';
import { MovimentacaoEstoque } from '../Entities/Estoque/MovimentacaoEstoque';
import { IMovimentacaoEstoqueRepository } from '../Interfaces/MovimentacaoEstoque/IMovimentacaoEstoqueRepository';
import { IPecaRepository } from '../Interfaces/Peca/IPecaRepository';
import { ObjectId } from 'bson';
import { TipoMovimentacao } from '../validators/TipoMovimentacao';

export class EstoqueService implements IEstoqueService {
  constructor(private repo: IEstoqueRepository, private movimentacaoRepo: IMovimentacaoEstoqueRepository, private pecaRepo: IPecaRepository) {}

  async getAllEstoque(): Promise<Estoque[]> {
    return await this.repo.getAllEstoque();
  }

    async createMovimentacao(movimentacaoData: Omit<MovimentacaoEstoque, 'id'>): Promise<MovimentacaoEstoque> {
      const movimentacao = new MovimentacaoEstoque(
        new ObjectId(movimentacaoData.pecaId),
        movimentacaoData.tipo,
        movimentacaoData.quantidade,
        movimentacaoData.data,
        movimentacaoData.origem
      );

          const tiposValidos = [TipoMovimentacao.ENTRADA, TipoMovimentacao.SAIDA];
      
          if (!tiposValidos.includes(movimentacao.tipo.toUpperCase() as any)) 
              throw new Error("Tipo inválido. Use ENTRADA ou SAIDA");

      const peca = await this.pecaRepo.getPecaById(movimentacao.pecaId);
      if (!peca) {
        throw new Error('Peça não encontrada para a movimentação de estoque');
      }

      const estoque = await this.repo.getEstoqueByPecaId(movimentacao.pecaId);

      if(movimentacao.tipo === 'ENTRADA') 
        estoque ? await this.repo.updateEstoque(movimentacao.pecaId, estoque.quantidade + movimentacao.quantidade) : await this.repo.createEstoque(new Estoque(movimentacao.pecaId, movimentacao.quantidade));  
      

      if(movimentacao.tipo === 'SAIDA') {

        if(!estoque) 
          throw new Error('Não há estoque para a peça especificada');
        
        if(estoque && estoque.quantidade < movimentacao.quantidade) {
          throw new Error('Quantidade insuficiente em estoque para a saída');
        }

        await this.repo.updateEstoque(movimentacao.pecaId, estoque.quantidade - movimentacao.quantidade);
      
      }
  
      await this.movimentacaoRepo.createMovimentacao(movimentacao);
      return movimentacao;
    }
  
    async listaMovimentacoes(): Promise<MovimentacaoEstoque[]> {
      return await this.movimentacaoRepo.listaMovimentacoes(); 
    }

  async getEstoqueByPecaId(pecaId: ObjectId): Promise<Estoque | null> {
    return await this.repo.getEstoqueByPecaId(pecaId);
  }

  async createEstoque(estoqueData: Omit<Estoque, 'id'>): Promise<Estoque> {
    const estoque = new Estoque(estoqueData.pecaId, estoqueData.quantidade);
    await this.repo.createEstoque(estoque);
    return estoque;
  }

  async updateEstoque(pecaId: ObjectId, quantidade: number): Promise<Estoque | null> {
    const existing = await this.repo.getEstoqueByPecaId(pecaId);
    if (!existing) return null;

    await this.repo.updateEstoque(pecaId, quantidade);
    return { ...existing, quantidade };
  }

  async deleteEstoque(pecaId: ObjectId): Promise<boolean> {
    const existing = await this.repo.getEstoqueByPecaId(pecaId);
    if (!existing) return false;

    await this.repo.deleteEstoque(pecaId);
    return true;
  }
}
