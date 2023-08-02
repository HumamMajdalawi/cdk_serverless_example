import {
  Controller,
  Request,
  Response,
  createControllerHandler,
} from "../util/apiGateway";
import {
  EventResponseType,
  GetMatchResponseType,
  MatchResponseType,
} from "../types";
import { IngestRepository } from "../database/ingestRepo";

export class GetMatch implements Controller<null, GetMatchResponseType> {
  async handle(req: Request<null>): Promise<Response<GetMatchResponseType>> {
    const { match_id } = req.getPathParameters();

    // TODO: validate if match is already exists or not
    // Return 404
    
    const ingestDataRepo = new IngestRepository();
    const events = await ingestDataRepo.getEvents(match_id);
    const formatedEvents: EventResponseType[] = [];
    events.forEach((event) => {
      formatedEvents.push({
        player: event.event_details.player.name,
        timestamp: event.timestamp,
        event_type: event.event_type,
        goal_type: event.event_details.goal_type,
        minute: event.event_details.minute,
        video_url: event.event_details.video_url,
      } as EventResponseType);
    });

    const matchDetails = {
      team: events[0].team,
      opponent: events[0].opponent,
      date: events[0].timestamp,
      match_id: events[0].match_id,
    } as MatchResponseType;

    return Response.OK({
      status: "success",
      match: {
        ...matchDetails,
        events: formatedEvents,
      },
    });
  }
}

export const handler = createControllerHandler(new GetMatch());
