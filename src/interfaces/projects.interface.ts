import { QueryResult } from "pg";

interface iProject {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate: Date;
  developerId: number;
}

interface iTech {
  id: number;
  name: string;
}

type iTechRequest = Omit<iTech, "id">;

type iProjectRequest = Omit<iProject, "id">;

type queryResultProjects = QueryResult<iProject>;

export { iProject, iProjectRequest, queryResultProjects, iTech, iTechRequest };
