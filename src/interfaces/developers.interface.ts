import { QueryResult } from "pg";

interface iDeveloper {
  id: number;
  name: string;
  email: string;
}

interface iDeveloperInfo {
  id: number;
  developerSince: Date;
  preferredOS: string;
  developerId: number;
}

type iDeveloperInfoRequest = Omit<iDeveloperInfo, "id" | "developerId">;

type iDeveloperRequest = Omit<iDeveloper, "id">;

type queryResultDeveloper = QueryResult<iDeveloper>;

type queryResultDeveloperInfo = QueryResult<iDeveloperInfo>;

export {
  iDeveloper,
  iDeveloperRequest,
  queryResultDeveloper,
  iDeveloperInfo,
  iDeveloperInfoRequest,
  queryResultDeveloperInfo,
};
