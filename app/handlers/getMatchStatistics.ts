// import {
//     Controller,
//     Request,
//     Response,
//     createControllerHandler,
//   } from "../util/apiGateway";
//   import {
//     EventResponseType,
//     GetMatchResponseType,
//     MatchResponseType,
//   } from "../types";
//   import { IngestRepository } from "../database/ingestRepo";
  
//   export class GetMatchStatistics implements Controller<null, any[]> {
//     async handle(req: Request<null>): Promise<Response<any[]>> {
//       const { match_id } = req.getPathParameters();
  
//       // TODO: validate if match is already exists or not
//       // Return 404
        

//       // Read from Statistics Table 
//         // return Response.OK({
//         //     status: "success",
//         //     statistics: [{event_type}]
//         // })
//     }
//   }
  
//   export const handler = createControllerHandler(new GetMatchStatistics());
  