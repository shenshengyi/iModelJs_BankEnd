import * as fs from "fs-extra";
import * as path from "path";
import {
  IModelHost,
  SnapshotDb,
  StandaloneDb,
  IModelDb,
  RepositoryLink,
  BackendRequestContext,
  PhysicalModel,
  SpatialCategory,
  PhysicalElement,
  GeometricElement2dHasTypeDefinition,
  DefinitionModel,
  Model,
  RepositoryModel,
  IModelHostConfiguration,
  FileNameResolver,
} from "@bentley/imodeljs-backend";
import { Handle_StandaloneDbTest } from "./IModelDbExample/StandaloneDbTest";
import { Handle_BriefcaseDbTest } from "./IModelDbExample/BriefcaseDbTest";
import { Handle_SnapshotDbTest } from "./IModelDbExample/SnapshotDbTest";
import { TestAnalySis } from "./Models/AnalysisImporter";
import { Handle_PhysicalMaterialTest } from "./Models/PhysicalMaterialTest";

async function APP() {
  // Start the backend
  await IModelHost.startup();
  // await Handle_StandaloneDbTest();
  //await Handle_BriefcaseDbTest();
  await Handle_SnapshotDbTest();
  //await TestAnalySis();
  // Handle_PhysicalMaterialTest();
  IModelHost.shutdown();
}
if (require.main === module) {
  APP();
}
