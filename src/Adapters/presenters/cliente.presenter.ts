import { ClienteResponseDto } from '../../application/dtos/cliente/cliente.dtos';
import { Cliente } from '../../enterprise/entities/cliente.entity';

export class ClientePresenter {
    present(cliente: Cliente): ClienteResponseDto {
        return {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email.value,
            cpf: cliente.documento.formatted,
            telefone: cliente.telefone,
        };
    }

    presentList(clientes: Cliente[]): ClienteResponseDto[] {
        return clientes.map((cliente) => this.present(cliente));
    }

    presentCreate(cliente: Cliente): ClienteResponseDto {
        return this.present(cliente);
    }
}
