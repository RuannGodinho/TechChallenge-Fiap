import { Servico } from '../../Entities/Servico';

export interface IServicoService {
    getAllServicos(): Promise<Servico[]>;
    getServicoById(id: string): Promise<Servico | null>;
    createServico(serviceData: Omit<Servico, 'id'>): Promise<Servico>;
    updateServico(id: string, serviceData: Partial<Servico>): Promise<Servico | null>;
    deleteServico(id: string): Promise<boolean>;
}