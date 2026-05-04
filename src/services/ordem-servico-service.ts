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
import { normalizeCpfCnpj } from "../utils/cpf-cnpj-utils";
import { OrdemPecaItem } from "../ValueObjects/ordem-peca-item";
import { Orcamento } from "../Entities/orcamento";
import { Peca } from "../Entities/Estoque/peca";
import { Servico } from "../Entities/servico";
import { MovimentacaoEstoque } from "../Entities/Estoque/movimentacao-estoque";
import { TipoMovimentacao } from "../validators/tipo-movimentacao";

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
        await this.validaBuscaCPFCNPJ(ordemServico);
        await this.validaBuscaVeiculo(ordemServico);

        const ordem = new OrdemServico(
            ordemServico.cpfCnpj as string,
            new ObjectId(ordemServico.veiculo),
            StatusOS.RECEBIDA.toUpperCase() as any,
            new Date(Date.now()),
            ordemServico.pecas || [],
            ordemServico.servicos || []
        );

        await this.repo.createOrdemServico(ordem);
        return ordem;
    }

    async listaOrdensServico(): Promise<OrdemServico[]> {
        return await this.repo.listaOrdensServico();
    }

    async updateOrdemServico(id: string,updates: Partial<OrdemServico>): Promise<OrdemServico | null> {
        const ordem = await this.getOrdemOrThrow(id);

        await this.validarCamposRelacionados(updates);

        if (updates.status) {
            await this.processarMudancaStatus(ordem, updates);
        }

        if (this.temItensParaAtualizar(updates)) {
            await this.processarItensEOrcamento(id, ordem, updates);
        }

        return await this.repo.updateOrdemServico(id, updates);
    }

    private async getOrdemOrThrow(id: string): Promise<OrdemServico> {
        const ordem = await this.repo.getOSById(id);

        if (!ordem) {
            throw new Error(`Ordem de serviço não encontrada para o id ${id}.`);
        }

        return ordem;
    }

    private async validarCamposRelacionados(updates: Partial<OrdemServico>): Promise<void> {
        await this.validaBuscaCPFCNPJ(updates);
        await this.validaBuscaVeiculo(updates);
    }

    private async processarMudancaStatus(ordem: OrdemServico,updates: Partial<OrdemServico>): Promise<void> {
        const novoStatus = updates.status!.toUpperCase() as StatusOS;
        const statusAtual = ordem.status.toUpperCase() as StatusOS;

        this.validarStatus(novoStatus);
        this.validarTransicao(statusAtual, novoStatus);

        if (novoStatus === StatusOS.EM_EXECUCAO) {
            await this.consumirEstoqueDaOS(ordem);
        }

        updates.status = novoStatus;
    }

    private async processarItensEOrcamento(id: string,ordem: OrdemServico,updates: Partial<OrdemServico>): Promise<void> {
        updates.valorTotal = 0;

        const pecas = await this.processarPecas(updates);
        const servicos = await this.processarServicos(updates);

        if (ordem.status.toUpperCase() === StatusOS.EM_DIAGNOSTICO.toUpperCase()) {
            await this.gerarOrcamento(id, updates.valorTotal, pecas, servicos);

            updates.status = StatusOS.AGUARDANDO_APROVACAO as StatusOS;
        }
    }


    private validarStatus(status: StatusOS): void {
        const validos = Object.values(StatusOS);

        if (!validos.includes(status)) {
            throw new Error("Status inválido.");
        }
    }

    private validarTransicao(atual: StatusOS,novo: StatusOS): void {
        const fluxo: Record<StatusOS, StatusOS[]> = {
            RECEBIDA: [StatusOS.EM_DIAGNOSTICO],
            "EM DIAGNOSTICO": [StatusOS.AGUARDANDO_APROVACAO],
            "AGUARDANDO APROVACAO": [StatusOS.EM_EXECUCAO],
            "EM EXECUCAO": [StatusOS.FINALIZADA],
            FINALIZADA: [StatusOS.ENTREGUE],
            ENTREGUE: []
        };

        const permitidos = fluxo[atual] || [];

        if (!permitidos.includes(novo)) {
            throw new Error(`Não é permitido alterar status de ${atual} para ${novo}`);
        }
    }

    private temItensParaAtualizar(updates: Partial<OrdemServico>): boolean {
        return !!(updates.pecas?.length &&updates.servicos?.length);
    }

    private async processarPecas(updates: Partial<OrdemServico>): Promise<Peca[]> {
        const retorno: Peca[] = [];

        for (const item of updates.pecas ?? []) {
            const peca = await this.pecaService.getPecaById(item.pecaId);

            if (!peca) {
                throw new Error(`Peça não encontrada para o ID ${item.pecaId}`);
            }

            if (!item.quantidade || item.quantidade <= 0) {
                throw new Error(`Quantidade inválida para peça ${item.pecaId}`);
            }

            await this.validaQuantidadeEstoque(item, false);

            item.valorUnitario = peca.preco;

            updates.valorTotal! += item.quantidade * item.valorUnitario;

            peca.quantidade = item.quantidade;
            retorno.push(peca);
        }

        return retorno;
    }

    private async processarServicos(updates: Partial<OrdemServico>): Promise<Servico[]> {
        const retorno: Servico[] = [];

        for (const id of updates.servicos ?? []) {
            const servico = await this.servicoService.getServicoById(id as unknown as string);

            if (!servico) {
                throw new Error(`Serviço não encontrado para o ID ${id}`);
            }

            updates.valorTotal! += servico.preco;

            retorno.push(servico);
        }

        return retorno;
    }

    private async consumirEstoqueDaOS(ordem: OrdemServico): Promise<void> {
        for (const item of ordem.pecas ?? []) {
            await this.validaQuantidadeEstoque(item, true);
        }
    }

    private async gerarOrcamento(ordemId: string,valorTotal: number,pecas: Peca[],servicos: Servico[]): Promise<void> {
        const orcamento = new Orcamento(
            new ObjectId(ordemId),
            1,
            "PENDENTE",
            pecas,
            servicos,
            valorTotal,
            new Date(),
            new Date()
        );

        await this.orcamentoService.createOrcamento(orcamento);
    }

    private async validaQuantidadeEstoque(pecaOrdem: OrdemPecaItem, consomeEstoque: boolean) {
        const estoque = await this.estoqueService.getEstoqueByPecaId(pecaOrdem.pecaId);

        if (!estoque)
            throw new Error(`Não há estoque para a peça ${pecaOrdem.pecaId}`);
        
            if(estoque.quantidade < pecaOrdem.quantidade) 
                throw new Error(`Quantidade insuficiente em estoque para a peça ${pecaOrdem.pecaId}`);

        if(consomeEstoque) {

            const movimentacaoEstoque = new MovimentacaoEstoque(
                pecaOrdem.pecaId,
                TipoMovimentacao.SAIDA,
                pecaOrdem.quantidade,
                new Date(Date.now()),
                'OS'
            );
            await this.estoqueService.createMovimentacao(movimentacaoEstoque);
        }
    }

    private async validaBuscaVeiculo(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.veiculo) {
            const veiculo = await this.veiculoService.getVeiculoById(ordemServico.veiculo as unknown as string);
            if (!veiculo) {
                throw new Error("Veículo não encontrado para o ID fornecido.");
            }
        }
    }

    private async validaBuscaCPFCNPJ(ordemServico: Partial<OrdemServico>) {
        if (ordemServico.cpfCnpj) {
            const normalized = normalizeCpfCnpj(ordemServico.cpfCnpj);
            ordemServico.cpfCnpj = normalized.stripped;

            const client = await this.clientService.getClienteByCpf(ordemServico.cpfCnpj);
            if (!client)
                throw new Error("Cliente não encontrado para o CPF/CNPJ fornecido.");
        }
    }    
}