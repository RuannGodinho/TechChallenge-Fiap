import { Db, ObjectId } from 'mongodb';
import { Cliente } from '../../enterprise/entities/cliente.entity';
import { Documento } from '../../enterprise/value-objects/documento.vo';
import { IClienteGateway } from '../../application/ports/cliente.gateway.port';
import { ClienteMapper, ClientePersistenceModel } from './mappers/cliente.mapper';

export class ClienteMongoGateway implements IClienteGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<ClientePersistenceModel>('Clientes');
    }

    async findAll(): Promise<Cliente[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => ClienteMapper.toDomain(row));
    }

    async findById(id: string): Promise<Cliente | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? ClienteMapper.toDomain(row) : null;
    }

    async findByDocumento(documento: Documento): Promise<Cliente | null> {
        const row = await this.collection.findOne({ cpf: documento.value });
        return row ? ClienteMapper.toDomain(row) : null;
    }

    async save(cliente: Cliente): Promise<Cliente> {
        const persistence = ClienteMapper.toPersistence(cliente);
        const result = await this.collection.insertOne(persistence);
        return new Cliente(
            cliente.nome,
            cliente.email,
            cliente.documento,
            cliente.telefone,
            result.insertedId.toString()
        );
    }

    async update(id: string, cliente: Cliente): Promise<Cliente | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const persistence = ClienteMapper.toPersistence(cliente);
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: persistence },
            { returnDocument: 'after' }
        );

        return result ? ClienteMapper.toDomain(result) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    }
}
