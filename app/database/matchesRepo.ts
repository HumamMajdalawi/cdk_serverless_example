import { createSportServiceTable } from "./db";
import { DynamoRepository } from "./dynamodbRepo";
import { MatchAttributes, MatchInputType } from "../types";

export class MatchesRepository extends DynamoRepository<MatchAttributes> {
  constructor() {
    super({
      name: "match",
      table: createSportServiceTable() as any,
      attributes: {
        PK: {
          partitionKey: true,
          type: "string",
          prefix: "MATCHID#",
          default: (data: { match_id: string }) => data.match_id,
        },
        SK: {
          sortKey: true,
          type: "string",
          prefix: "TEAM#",
          default: (data: { team: string }) => data.team,
        },
        match_id: "string",
        date: "string",
        team: "string",
        opponent: "string",
      },
    });
  }

  async createMatch(params: MatchInputType): Promise<void> {
    await this.create({ PK: params.match_id, SK: params.team, ...params });
  }

  async getMatch(match_id: string, team: string): Promise<MatchAttributes> {
    return this.getPkSk(match_id, team);
  }

  async getMatches(): Promise<MatchAttributes[]> {
    return this.queryDocumentsByEt("match") as unknown as MatchAttributes[];
  }
}
