import { OrdemServico } from "../Entities/OrdemServico";
import { IOrdemServicoRepository } from "../Interfaces/OrdemServico/IOrdemServicoRepository";
import { IOrdemServicoService } from "../Interfaces/OrdemServico/IOrdemServicoService";
import { StatusOS } from "../validators/StatusOS";
import { IClienteService } from "../Interfaces/Cliente/IClienteService";
import { IVeiculoService } from "../Interfaces/Veiculo/IVeiculoService";
import { IPecaService } from "../Interfaces/Peca/IPecaService";
import { IServicoService } from "../Interfaces/Servico/IServicoService";
import { IEstoqueService } from "../Interfaces/Estoque/IEstoqueService";
import { ObjectId } from "mongodb";
import { cpfValidator } from "cpf-cnpj-validator";
import { OrdemPecaItem } from "../ValueObjects/OrdemPecaItem";

export class OrdemServicoService implements IOrdemServicoService {
    constructor(
        private repo: IOrdemServicoRepository,
        private clientService: IClienteService,
        private veiculoService: IVeiculoService,
        private pecaService: IPecaService,
        private servicoService: IServicoService,
        private estoqueService: IEstoqueService     
        ) {}

    async createOrdemServico(ordemServico: OrdemServico): Promise<OrdemServico> {
        const ordem = new OrdemServico(
            ordemServico.CpfCnpj,
            new ObjectId(ordemServico.Veiculo),
            StatusOS.RECEBIDA.toUpperCase() as any,
            new Date(Date.now()),
            ordemServico.Pecas || [],
            ordemServico.Servicos || []
        )

        await this.ValidaBuscaCPFCNPJ(ordemServico);

        await this.ValidaBuscaVeiculo(ordemServico);

        await this.repo.createOrdemServico(ordem);

        return ordem;
    }

    async listaOrdensServico(): Promise<OrdemServico[]> {
        return await this.repo.listaOrdensServico();
    }

    async updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null> {

        await this.ValidaBuscaCPFCNPJ(updates);
        
        await this.ValidaBuscaVeiculo(updates);

        if( updates.Pecas && updates.Pecas.length > 0 && updates.Servicos && updates.Servicos.length > 0){
            await this.AdicionaPecasEValorOs(updates);

            await this.ValidaBuscaServico(updates);

            //Criar e enviar orcamento para cliente aprovar

            //Validar se o status atual e "Em Diagnostico" para poder passar para "Aguardando Aprovação"
            if(updates.Status && updates.Status.toUpperCase() != StatusOS.EM_DIAGNOSTICO.toUpperCase())
                throw new Error("Status deve ser 'Em Diagnóstico' para passar para 'Aguardando Aprovação'");

            updates.Status = StatusOS.AGUARDANDO_APROVACAO.toUpperCase() as any;
        }

        return await this.repo.updateOrdemServico(id, updates);
    }

    private async ValidaBuscaVeiculo(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.Veiculo) {
            const veiculo = await this.veiculoService.getVeiculoById(ordemServico.Veiculo as unknown as string);
            if (!veiculo) {
                throw new Error("Veículo não encontrado para o ID fornecido.");
            }
        }
    }

    private async AdicionaPecasEValorOs(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.Pecas && ordemServico.Pecas.length > 0) {
            for (const pecaOrdem of ordemServico.Pecas) {
                const peca = await this.pecaService.getPecaById(pecaOrdem.PecaId);
                if (!peca) {
                    throw new Error(`Peça não encontrada para o ID ${pecaOrdem.PecaId}`);
                }
                if(pecaOrdem.Quantidade <= 0 || pecaOrdem.Quantidade === undefined) {
                    throw new Error(`Necessario quantidade para a peça ${pecaOrdem.PecaId}`);
                }

                //Validar quantidades de pecas no estoque(se quantidade de pecas da os pode ser utilizada)
                await this.ValidaQuantidadeEstoque(pecaOrdem);

                pecaOrdem.ValorUnitario = peca.Preco;
                ordemServico.ValorTotal = (ordemServico.ValorTotal || 0) + (pecaOrdem.Quantidade * pecaOrdem.ValorUnitario);
            };
        }
    }

    private async ValidaQuantidadeEstoque(pecaOrdem: OrdemPecaItem) {
        const estoque = await this.estoqueService.getEstoqueByPecaId(pecaOrdem.PecaId);

        if (!estoque)
            throw new Error(`Não há estoque para a peça ${pecaOrdem.PecaId}`);
        
            if(estoque.Quantidade < pecaOrdem.Quantidade) 
                throw new Error(`Quantidade insuficiente em estoque para a peça ${pecaOrdem.PecaId}`);
        
    }

    private async ValidaBuscaServico(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.Servicos && ordemServico.Servicos.length > 0) {
            for (const servicoId of ordemServico.Servicos) {
                const servico = await this.servicoService.getServicoById(servicoId as unknown as string);
                if (!servico) {
                    throw new Error(`Serviço não encontrado para o ID ${servicoId}`);
                }

                ordemServico.ValorTotal = (ordemServico.ValorTotal || 0) + servico.Preco;
            };
        }
    }  

    private async ValidaBuscaCPFCNPJ(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.CpfCnpj) {
            // Validações se necessário, por exemplo, se atualizar CPF, validar CPF
            if (!cpfValidator.isValid(ordemServico.CpfCnpj))
                throw new Error("CPF inválido");

            ordemServico.CpfCnpj = cpfValidator.strip(ordemServico.CpfCnpj);

            const client = await this.clientService.getClienteByCpf(ordemServico.CpfCnpj);
            if (!client)
                throw new Error("Cliente não encontrado para o CPF/CNPJ fornecido.");

        }
    }
}