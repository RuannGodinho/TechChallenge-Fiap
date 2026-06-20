export interface FindQuery<T> {
  filter?: Partial<T>;
  sort?: { [K in keyof T]?: 1 | -1 };
  limit?: number;
  skip?: number;
}

export interface IGatewayPort<
  TEntity extends { _id?: unknown },
  TCreateDTO = Partial<TEntity>,
  TUpdateDTO extends Partial<TEntity> = Partial<TEntity>
> {
  findAll(query?: FindQuery<TEntity>): Promise<TEntity[]>;
  findById(id: string): Promise<TEntity | null>;
  findBy(criteria: Partial<TEntity>): Promise<TEntity[]>;
  create(dto: TCreateDTO): Promise<TEntity>;
  update(id: string, dto: TUpdateDTO): Promise<TEntity>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
