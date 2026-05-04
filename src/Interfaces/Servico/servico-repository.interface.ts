import { Servico } from '../../Entities/servico';

export interface IServicoRepository {
    getAllServicos(): Promise<Servico[]>;
    getServicoById(id: string): Promise<Servico | null>;
    createServico(service: Servico): Promise<void>;
    updateServico(id: string, service: Servico): Promise<void>;
    deleteServico(id: string): Promise<void>;
}