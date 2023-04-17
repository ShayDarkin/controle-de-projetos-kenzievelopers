import { NextFunction, Request, Response } from "express";
import {
  iDeveloperInfoRequest,
  queryResultDeveloper,
  queryResultDeveloperInfo,
} from "../interfaces/developers.interface";
import format from "pg-format";
import { client } from "../database";
import { QueryConfig } from "pg";

const ensureMiddlewareEmailExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const email: string = request.body.email;

  const queryString: string = format(
    `
    SELECT *
    FROM developers
    WHERE email = %L;
    `,
    email
  );

  const queryResult: queryResultDeveloper = await client.query(queryString);

  if (queryResult.rowCount === 0) {
    return next();
  }

  return response.status(409).json({ message: "Email already exists." });
};

const ensureMiddlewareDeveloperSearch = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT *
    FROM developers
    WHERE id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: queryResultDeveloper = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Developer not found." });
  }

  response.locals.developer = queryResult.rows[0];

  return next();
};

const ensureMiddlewareDeveloperInfoExist = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const developerId: number = parseInt(request.params.id);
  const payload: iDeveloperInfoRequest = request.body;
  const operationalSystem = ["Windows", "Linux", "MacOS"];

  const queryString: string = `
    SELECT * 
      FROM developer_infos 
        WHERE "developerId" = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult: queryResultDeveloperInfo = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    if (operationalSystem.includes(payload.preferredOS)) {
      response.locals.developerInfo = queryResult.rows[0];
      return next();
    } else {
      return response.status(400).json({
        message: "Invalid OS option.",
        options: ["Windows", "Linux", "MacOS"],
      });
    }
  }

  return response
    .status(409)
    .json({ message: "Developer infos already exists." });
};

export {
  ensureMiddlewareEmailExists,
  ensureMiddlewareDeveloperSearch,
  ensureMiddlewareDeveloperInfoExist,
};
