import { ObjectId } from "mongodb";
import { Estoque } from "../../Entities/Estoque/estoque";

export interface IEstoqueRepository {
    getAllEstoque(): Promise<Estoque[]>;
    createEstoque(estoque: Estoque): Promise<void>;
    deleteEstoque(pecaId: ObjectId): Promise<void>;
    getEstoqueByPecaId(pecaId: ObjectId): Promise<Estoque | null>;
    updateEstoque(pecaId: ObjectId, quantidade: number): Promise<void>;
}