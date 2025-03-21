import { database } from "../database.js";
import { Hono } from "hono";
import type { MeasurementKind } from "../types.js";

const application = new Hono();

application.post("/", async (context) => {
  const body: {
    brand_id: number;
    name: string;
    evaluation?: {
      database_id: number;
      measurements?: [
        {
          kind: string;
          label: string;
          left_channel: string;
          right_channel: string;
        },
      ];
      review_score: number;
      review_url: string;
      shop_url: string;
    };
  } = await context.req.json();

  const result = await database.transaction().execute(async (transaction) => {
    const model = await transaction
      .insertInto("models")
      .values({
        brand_id: body.brand_id,
        name: body.name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    let evaluation:
      | {
          database_id: string;
          id: string;
          model_id: string;
          review_score: number | null;
          review_url: string | null;
          shop_url: string | null;
        }
      | undefined = undefined;
    const measurements: {
      id: string;
      evaluation_id: string;
      kind: string;
      label: string;
      left_channel: string;
      right_channel: string;
    }[] = [];

    if (body.evaluation != undefined) {
      evaluation = await transaction
        .insertInto("evaluations")
        .values({
          database_id: body.evaluation.database_id,
          model_id: model.id,
          review_score: body.evaluation.review_score,
          review_url: body.evaluation.review_url,
          shop_url: body.evaluation.shop_url,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      if (body.evaluation.measurements != undefined) {
        for (const measurement of body.evaluation.measurements) {
          const measurementRecord = await transaction
            .insertInto("measurements")
            .values({
              evaluation_id: evaluation!.id,
              kind: measurement.kind as MeasurementKind,
              label: measurement.label,
              left_channel: measurement.left_channel,
              right_channel: measurement.right_channel,
            })
            .returningAll()
            .executeTakeFirstOrThrow();
          measurements.push({
            id: measurementRecord.id,
            evaluation_id: evaluation!.id,
            kind: measurementRecord.kind,
            label: measurementRecord.label,
            left_channel: measurementRecord.left_channel,
            right_channel: measurementRecord.right_channel,
          });
        }
      }
    }

    return {
      evaluation: {
        ...evaluation,
        measurements: measurements,
      },
      ...model,
    };
  });

  return context.json(result);
});

export default application;
