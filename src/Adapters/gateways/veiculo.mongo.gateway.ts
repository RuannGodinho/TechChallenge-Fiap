import { Db, ObjectId } from 'mongodb';
import { Veiculo } from '../../enterprise/entities/veiculo.entity';
import { Placa } from '../../enterprise/value-objects/placa.vo';
import { IVeiculoGateway } from '../../application/ports/veiculo.gateway.port';
import { VeiculoMapper, VeiculoPersistenceModel } from './mappers/veiculo.mapper';

export class VeiculoMongoGateway implements IVeiculoGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<VeiculoPersistenceModel>('Veiculos');
    }

    async findAll(): Promise<Veiculo[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => VeiculoMapper.toDomain(row));
    }

    async findById(id: string): Promise<Veiculo | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? VeiculoMapper.toDomain(row) : null;
    }

    async findByPlaca(placa: Placa): Promise<Veiculo | null> {
        const row = await this.collection.findOne({ placa: placa.value });
        return row ? VeiculoMapper.toDomain(row) : null;
    }

    async save(veiculo: Veiculo): Promise<Veiculo> {
        const persistence = VeiculoMapper.toPersistence(veiculo);
        const result = await this.collection.insertOne(persistence);
        return new Veiculo(
            veiculo.placa,
            veiculo.modelo,
            veiculo.ano,
            veiculo.marca,
            result.insertedId.toString()
        );
    }

    async update(id: string, veiculo: Veiculo): Promise<Veiculo | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const persistence = VeiculoMapper.toPersistence(veiculo);
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: persistence },
            { returnDocument: 'after' }
        );

        return result ? VeiculoMapper.toDomain(result) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    }
}
