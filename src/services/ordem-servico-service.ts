import { OrdemServico } from "../Entities/ordem-servico";
import { IOrdemServicoRepository } from "../Interfaces/OrdemServico/ordem-servico-repository.interface";
import { IOrdemServicoService } from "../Interfaces/OrdemServico/ordem-servico-service.interface";
import { StatusOS } from "../validators/status-os";
import { IClienteService } from "../Interfaces/Cliente/cliente-service.interface";
import { IVeiculoService } from "../Interfaces/Veiculo/veiculo-service.interface";
import { IPecaService } from "../Interfaces/Peca/peca-service.interface";
import { IServicoService } from "../Interfaces/Servico/servico-service.interface";
import { IEstoqueService } from "../Interfaces/Estoque/estoque-service.interface";
import { IOrcamentoService } from "../Interfaces/Orcamento/orcamento-service.interface";
import { ObjectId } from "mongodb";
import { cpfValidator } from "cpf-cnpj-validator";
import { OrdemPecaItem } from "../ValueObjects/ordem-peca-item";
import { Orcamento } from "../Entities/orcamento";
import { Peca } from "../Entities/Estoque/peca";
import { Servico } from "../Entities/servico";

export class OrdemServicoService implements IOrdemServicoService {
    constructor(
        private repo: IOrdemServicoRepository,
        private clientService: IClienteService,
        private veiculoService: IVeiculoService,
        private pecaService: IPecaService,
        private servicoService: IServicoService,
        private estoqueService: IEstoqueService,
        private orcamentoService: IOrcamentoService   
        ) {}

    async createOrdemServico(ordemServico: OrdemServico): Promise<OrdemServico> {
        const ordem = new OrdemServico(
            ordemServico.cpfCnpj,
            new ObjectId(ordemServico.veiculo),
            StatusOS.RECEBIDA.toUpperCase() as any,
            new Date(Date.now()),
            ordemServico.pecas || [],
            ordemServico.servicos || []
        )

        await this.validaBuscaCPFCNPJ(ordemServico);

        await this.validaBuscaVeiculo(ordemServico);

        await this.repo.createOrdemServico(ordem);

        return ordem;
    }

    async listaOrdensServico(): Promise<OrdemServico[]> {
        return await this.repo.listaOrdensServico();
    }

    async updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null> {

        const ordemServicoExistente = await this.repo.getOSById(id);

        if (!ordemServicoExistente) 
            throw new Error(`Ordem de serviço não encontrada para o id ${id}.`);
        
        await this.validaBuscaCPFCNPJ(updates);
        
        await this.validaBuscaVeiculo(updates);
        
        const tiposValidos = [StatusOS.RECEBIDA, StatusOS.EM_DIAGNOSTICO, StatusOS.AGUARDANDO_APROVACAO, StatusOS.EM_EXECUCAO, StatusOS.FINALIZADA, StatusOS.ENTREGUE];

        if (updates.status &&!tiposValidos.includes(updates.status.toUpperCase() as any)) {
            throw new Error("Status inválido. Use RECEBIDA, EM DIAGNOSTICO, AGUARDANDO APROVACAO, EM EXECUCAO, FINALIZADA ou ENTREGUE");  
        }   

        let consomeEstoque = false;
        if(ordemServicoExistente.servicos && ordemServicoExistente.servicos?.length > 0 && ordemServicoExistente.pecas && ordemServicoExistente.pecas?.length > 0) {
            
            if(updates.status?.toUpperCase() === StatusOS.EM_EXECUCAO.toUpperCase()) {
                 //Validar se o status atual e "Aguardando Aprovação" para poder passar para "Em Execução"
                if(ordemServicoExistente.status && ordemServicoExistente.status.toUpperCase() != StatusOS.AGUARDANDO_APROVACAO.toUpperCase())
                    throw new Error("Status deve ser 'Aguardando Aprovação' para passar para 'Em Execução'");

                consomeEstoque = true;

                for (const pecaOrdem of ordemServicoExistente.pecas) {
                    await this.validaQuantidadeEstoque(pecaOrdem, consomeEstoque);
                }

                await this.validaBuscaServico(ordemServicoExistente);
            }
        }
        

        if( updates.pecas && updates.pecas.length > 0 && updates.servicos && updates.servicos.length > 0 ) {
            updates.valorTotal = updates.valorTotal || 0;

            const pecas = await this.adicionaPecasEValorOs(updates, consomeEstoque);

            const servicos = await this.validaBuscaServico(updates);

            if(ordemServicoExistente.status.toUpperCase() === StatusOS.EM_DIAGNOSTICO.toUpperCase()) {
                //Criar e enviar orcamento para cliente aprovar
                const orcamento = new Orcamento(
                    new ObjectId(id),
                    1,
                    'PENDENTE',
                    pecas,
                    servicos,
                    updates.valorTotal,
                    new Date(Date.now()),
                    new Date(Date.now())
                )

                await this.orcamentoService.createOrcamento(orcamento);

                updates.status = StatusOS.AGUARDANDO_APROVACAO.toUpperCase() as any;
            }
        }

        return await this.repo.updateOrdemServico(id, updates);
    }

    private async validaBuscaVeiculo(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.veiculo) {
            const veiculo = await this.veiculoService.getVeiculoById(ordemServico.veiculo as unknown as string);
            if (!veiculo) {
                throw new Error("Veículo não encontrado para o ID fornecido.");
            }
        }
    }

    private async adicionaPecasEValorOs(ordemServico: Partial<OrdemServico>, consomeEstoque: boolean): Promise<Peca[]> {
        const pecasRetorno: Peca[] = [];
        if (ordemServico.pecas && ordemServico.pecas.length > 0) {

            ordemServico.valorTotal = ordemServico.valorTotal || 0;
            for (const pecaOrdem of ordemServico.pecas) {
                const peca = await this.pecaService.getPecaById(pecaOrdem.pecaId);
                if (!peca) {
                    throw new Error(`Peça não encontrada para o ID ${pecaOrdem.pecaId}`);
                }
                if(pecaOrdem.quantidade <= 0 || pecaOrdem.quantidade === undefined) {
                    throw new Error(`Necessario quantidade para a peça ${pecaOrdem.pecaId}`);
                }

                //Validar quantidades de pecas no estoque(se quantidade de pecas da os pode ser utilizada)
                await this.validaQuantidadeEstoque(pecaOrdem, consomeEstoque);

                pecaOrdem.valorUnitario = peca.preco;
                ordemServico.valorTotal += (pecaOrdem.quantidade * pecaOrdem.valorUnitario);

                peca.quantidade = pecaOrdem.quantidade;
                pecasRetorno.push(peca);
            };
        }
        return pecasRetorno;
    }

    private async validaQuantidadeEstoque(pecaOrdem: OrdemPecaItem, consomeEstoque: boolean) {
        const estoque = await this.estoqueService.getEstoqueByPecaId(pecaOrdem.pecaId);

        if (!estoque)
            throw new Error(`Não há estoque para a peça ${pecaOrdem.pecaId}`);
        
            if(estoque.quantidade < pecaOrdem.quantidade) 
                throw new Error(`Quantidade insuficiente em estoque para a peça ${pecaOrdem.pecaId}`);

        if(consomeEstoque) {
            estoque.quantidade -= pecaOrdem.quantidade;
            await this.estoqueService.updateEstoque(estoque.pecaId, estoque.quantidade);
        }
    }

    private async validaBuscaServico(ordemServico: Partial<OrdemServico>) {
        const servicosRetorno: Servico[] = [];
        if (ordemServico.servicos && ordemServico.servicos.length > 0) {
            ordemServico.valorTotal = ordemServico.valorTotal || 0;
            for (const servicoId of ordemServico.servicos) {
                const servico = await this.servicoService.getServicoById(servicoId as unknown as string);
                if (!servico) {
                    throw new Error(`Serviço não encontrado para o ID ${servicoId}`);
                }

                ordemServico.valorTotal += servico.preco;
                servicosRetorno.push(servico);
            };
        }
        return servicosRetorno;
    }

    private async validaBuscaCPFCNPJ(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.cpfCnpj) {
            // Validações se necessário, por exemplo, se atualizar CPF, validar CPF
            if (!cpfValidator.isValid(ordemServico.cpfCnpj))
                throw new Error("CPF inválido");

            ordemServico.cpfCnpj = cpfValidator.strip(ordemServico.cpfCnpj);

            const client = await this.clientService.getClienteByCpf(ordemServico.cpfCnpj);
            if (!client)
                throw new Error("Cliente não encontrado para o CPF/CNPJ fornecido.");

        }
    }
}