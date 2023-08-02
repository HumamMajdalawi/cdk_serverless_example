import {
  Controller,
  Response,
  createControllerHandler,
} from "../util/apiGateway";
import {
  GetMatchsResponseType,
  MatchResponseType,
} from "../types";
import { MatchesRepository } from "../database/matchesRepo";

export class GetMatchesController implements Controller<null, GetMatchsResponseType> {
  async handle(): Promise<Response<GetMatchsResponseType>> {
    const matchesRepo = new MatchesRepository();
    const matches = await matchesRepo.getMatches();
    const res: MatchResponseType[] = [];
    matches.forEach((match) => {
      res.push({
        team: match.team,
        date: match.date,
        opponent: match.opponent,
        match_id: match.match_id,
      });
    });

    return Response.OK({
      status: "success",
      matches: res,
    });
  }
}

export const handler = createControllerHandler(new GetMatchesController());
