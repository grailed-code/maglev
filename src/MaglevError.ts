import { RequestError } from "./Request";
import * as Deploy from "./Deploy";
import * as Heroku from "./Heroku";

type MaglevError =
  | RequestError
  | Deploy.Bundle.CreateError
  | Deploy.Bundle.NotFoundError
  | Heroku.Build.CreateError
  | Heroku.Build.NotFoundError
  | Heroku.Release.NotFoundError
  | Heroku.Slug.NotFoundError;

export default MaglevError;
