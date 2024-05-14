import { erase, seed } from "./seedFunctions";

erase().then(() => seed());
