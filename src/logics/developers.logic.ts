import { Request, Response } from "express";
import format from "pg-format";
import {
  iDeveloper,
  iDeveloperInfo,
  iDeveloperInfoRequest,
  iDeveloperRequest,
  queryResultDeveloper,
} from "../interfaces/developers.interface";
import { client } from "../database";
import { queryResultDeveloperInfo } from "../interfaces/developers.interface";

const createDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const payload: iDeveloperRequest = request.body;

  const queryString: string = format(
    `
    INSERT INTO 
        developers(%I)
    VALUES(%L)
    RETURNING *;
  `,
    Object.keys(payload),
    Object.values(payload)
  );

  const queryResult: queryResultDeveloper = await client.query(queryString);

  return response.status(201).json(queryResult.rows[0]);
};

const readDeveloperAndProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = format(
    `
    SELECT 
      dv.id               AS "developerId",
      dv.name             AS "developerName",
      dv.email            AS "developerEmail",
      di."developerSince" AS "developerInfoDeveloperSince",
      di."preferredOS"    AS "developerInfoPreferredOS"

    FROM developers AS dv
      
    LEFT JOIN developer_infos AS di 
      ON di."developerId" = dv.id
      
      WHERE dv.id = %L;
  `,
    id
  );

  const queryResult: queryResultDeveloper = await client.query(queryString);

  return response.status(200).json(queryResult.rows[0]);
};

const updateDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const payload: iDeveloperRequest = request.body;
  const id: number = parseInt(request.params.id);

  const queryString: string = format(
    `
    UPDATE developers
    SET(%I) = ROW(%L)
      WHERE id = %L
    RETURNING *;

  `,
    Object.keys(payload),
    Object.values(payload),
    id
  );

  const queryResult: queryResultDeveloper = await client.query(queryString);

  return response.status(200).json(queryResult.rows[0]);
};

const deleteDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = format(
    `
  DELETE 
    FROM developers
      WHERE id =%L;
  `,
    id
  );

  const queryResult: queryResultDeveloper = await client.query(queryString);

  return response.status(204).send();
};

const createDeveloperInfos = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const devInfo: iDeveloperInfoRequest = request.body;
  const id: number = parseInt(request.params.id);

  const payload = {
    ...devInfo,
    developerId: id,
  };

  const queryString: string = format(
    `
   INSERT INTO developer_infos (%I)
   VALUES(%L)
   RETURNING *;

  `,
    Object.keys(payload),
    Object.values(payload)
  );

  const queryResult: queryResultDeveloperInfo = await client.query(queryString);

  return response.status(201).json(queryResult.rows[0]);
};
export {
  createDeveloper,
  readDeveloperAndProjects,
  updateDeveloper,
  deleteDeveloper,
  createDeveloperInfos,
};
