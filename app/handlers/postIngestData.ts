import {
  Controller,
  Request,
  Response,
  createControllerHandler,
} from "../util/apiGateway";
import {
  IngestDataAttributes,
  IngestDataInputType,
  SuccessMsgType,
} from "../types";
import * as yup from "yup";
import { IngestRepository } from "../database/ingestRepo";

const playerSchema = {
  name: yup.string().required(),
  position: yup.string().required(),
  number: yup.number().required(),
};

const assist = {
  name: yup.string().required(),
  position: yup.string().required(),
  number: yup.number().required(),
};

const eventDetailsSchema = {
  player: yup.object().shape(playerSchema).required(),
  goal_type: yup.string().required(),
  minute: yup.number().required(),
  assist: yup.object().shape(assist).required(),
  video_url: yup.string().nullable(),
};

const schema = yup.object().shape({
  match_id: yup.string().required(),
  timestamp: yup.string().required(),
  team: yup.string().required(),
  opponent: yup.string().required(),
  event_type: yup.boolean().required(),
  emailId: yup.string().nullable(),
  productId: yup.string().nullable(),
  productName: yup.string().nullable(),
  comments: yup.string().nullable(),
  damages: yup.string().nullable(),
  event_details: yup.object().shape(eventDetailsSchema).required(),
});

export class PostIngestDataController
  implements Controller<IngestDataInputType, SuccessMsgType>
{
  async handle(
    req: Request<IngestDataInputType>
  ): Promise<Response<SuccessMsgType>> {
    const data = req.getData();

    try {
      schema.validateSync(data);
    } catch (e: any) {
      return Response.VALIDATION_FAILED(e.message);
    }
    const ingestRepo = new IngestRepository();
    const eventId = await ingestRepo.createEvent(data);
    return Response.OK({
      status: "success",
      message: "Data successfully ingested.",
      data: {
        event_id: eventId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const handler = createControllerHandler(new PostIngestDataController());
