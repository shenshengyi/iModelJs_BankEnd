import { BackendRequestContext, SnapshotDb } from "@bentley/imodeljs-backend";
import { DbResult } from "@bentley/bentleyjs-core";

class ImportAndExportSchema {
  public constructor() {}
  public async CreateIModelFromSeed(
    seedFileName: string,
    MyiModelFileName: string
  ) {
    const seedDb: SnapshotDb = SnapshotDb.openFile(seedFileName);
    this._imodel = SnapshotDb.createFrom(seedDb, MyiModelFileName);
    if (this._imodel) {
      console.log("imodel创建成功");
    } else {
      console.log("imodel创建失败");
    }
    seedDb.close();
  }
  public async ImportSchema(schemaFilePath: string) {
    if (this._imodel == undefined) {
      return;
    }
    //导入Schema.

    let imodel = this._imodel;
    imodel.importSchemas(this.requestContext, [schemaFilePath]);
  }
  public async ExportEchema(savedSchemaPath: string) {
    if (this._imodel === undefined) {
      return;
    }
    if (
      DbResult.BE_SQLITE_OK ===
      this._imodel.nativeDb.exportSchemas(savedSchemaPath)
    ) {
      console.log("schema导出成功");
    } else {
      console.log("schema导出失败");
    }
  }
  public async dispose() {
    if (this._imodel != undefined) {
      this._imodel.close();
    }
  }
  private requestContext = new BackendRequestContext();
  private _imodel: SnapshotDb | undefined;
}

export async function ImportAndExportSchema_Handle() {
  const seedFileName = "./data/Baytown.bim";
  const testFileName = "./data/TestBaytown.bim";
  const example = new ImportAndExportSchema();
  example.CreateIModelFromSeed(seedFileName, testFileName);
  const schemaPath = "./data/RobotWorld.ecschema.xml";
  await example.ImportSchema(schemaPath);
  const SaveSchemaFilePath = "D:/schema/";
  await example.ExportEchema(SaveSchemaFilePath);
  example.dispose();
}
