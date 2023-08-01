import { createSportServiceTable } from './db'
import { Entity } from 'dynamodb-toolbox'
import { EntityConstructor, SchemaType } from 'dynamodb-toolbox/dist/classes/Entity'
import { queryOptions } from 'dynamodb-toolbox/dist/classes/Table'
import { FilterExpressions } from 'dynamodb-toolbox/dist/lib/expressionBuilder'


export abstract class DynamoRepository<Schema extends { [key in keyof Schema]: SchemaType }> {
  public entity: Entity<any>
  constructor(entityInfo: EntityConstructor, private table = createSportServiceTable()) {
    this.entity = new Entity(entityInfo)
  }

  async transactCreate(params: Array<Schema>): Promise<void> {
    await this.table.transactWrite(params.map((param) => this.entity.putTransaction(param)))
  }

  async transactDelete(params: Array<Schema>): Promise<void> {
    await this.table.transactWrite(params.map((param) => this.entity.deleteTransaction(param)))
  }

  async create(createParams: Partial<Schema>): Promise<void> {
    await this.entity.put(createParams)
  }

  public async get(id: string): Promise<Schema> {
    const { Item } = await this.entity.get({
      PK: id,
      SK: id,
    } as unknown as Schema)
    return Item
  }

  public async getPkSk(pkId: string, skId: string): Promise<Schema> {
    const { Item } = await this.entity.get({
      PK: pkId,
      SK: skId,
    } as unknown as Schema)
    return Item
  }

  public async updateByPkSk(
    pkId: string,
    skId: string | number,
    params: Partial<Schema>,
    conditions?: queryOptions,
  ): Promise<Schema> {
    const response = (await this.entity.update(
      {
        PK: pkId,
        SK: skId,
        ...params,
      },
      {
        returnValues: 'all_new',
        conditions,
      },
    )) as unknown as { Attributes: Schema }
    return response.Attributes
  }

  public async update(
    id: string,
    params: Partial<Schema>,
    conditions?: FilterExpressions,
    customUpdateExpression?: any,
  ): Promise<Schema> {
    const response = (await this.entity.update(
      {
        PK: id,
        SK: id,
        ...params,
      },
      {
        returnValues: 'all_new',
        conditions,
      },
      customUpdateExpression,
    )) as unknown as { Attributes: Schema }
    return response.Attributes
  }

  public async delete(id: string): Promise<void> {
    return this.entity.delete({
      PK: id,
      SK: id,
    } as unknown as Schema)
  }

  public async deletePkSk(pkId: string, skId: string): Promise<void> {
    return this.entity.delete({
      PK: pkId,
      SK: skId,
    } as unknown as Schema)
  }

  public async clear(): Promise<void> {
    const { Items } = (await this.table.scan()) as unknown as {
      Items: Schema & { PK: string; SK: string }[]
    }
    await Promise.all(Items.map((item) => this.deletePkSk(item.PK, item.SK)))
    return
  }

  public async queryData(pk: string, queryOptions = {}, limit = 100): Promise<unknown> {
    let query = await this.entity.query(pk, queryOptions)
    let items = query.Items
    if (items.length >= limit) {
      return items
    }

    while (query.LastEvaluatedKey && items.length < limit) {
      query = await query.next()
      items = [...items, ...query.Items]
    }
    return items
  }

  public queryIndex =
    (index: string) =>
    async (queryId: string, options: queryOptions = {}): Promise<Schema[]> => {
      let query = await this.entity.query(queryId, {
        index,
        ...options,
      })

      let items = query.Items

      while (query.LastEvaluatedKey) {
        const nextItem = await query.next()
        query = nextItem
        items = [...items, ...query.Items]
      }
      return items
    }
}
