import * as fs from "fs-extra";
import { DbResult, OpenMode } from "@bentley/bentleyjs-core";
import {
  BackendRequestContext,
  ECSqlStatement,
  IModelDb,
  IModelHost,
  IModelJsFs,
  PhysicalMaterial,
  SnapshotDb,
} from "@bentley/imodeljs-backend";
import { IModel } from "@bentley/imodeljs-common";
import { readFileSync, fstat } from "fs";
import {
  Aluminum,
  PhysicalMaterialSchema,
  Aggregate,
  Asphalt,
  Concrete,
  Steel,
} from "@bentley/physical-material-backend";
class PhysicalMaterialTest {
  public constructor() {
    this._db = undefined;
  }
  public async OpenSanapshotDB(filePath: string) {
    this._db = SnapshotDb.createEmpty(filePath, {
      rootSubject: { name: "PhysicalMaterialSchema" },
      createClassViews: true,
    });
    const schemaFilePath =
      "D:\\imodel-example\\backend\\data\\PhysicalMaterial.ecschema.xml";
    PhysicalMaterialSchema.registerSchema();
    await this._db.importSchemas(new BackendRequestContext(), [schemaFilePath]);
    console.log(this._db.querySchemaVersion("PhysicalMaterial"));
    for (let i = 1; i <= 3; i++) {
      Aggregate.create(
        this._db,
        IModel.dictionaryId,
        `${Aggregate.className}${i}`
      ).insert();
      Aluminum.create(
        this._db,
        IModel.dictionaryId,
        `${Aluminum.className}${i}`
      ).insert();
      Asphalt.create(
        this._db,
        IModel.dictionaryId,
        `${Asphalt.className}${i}`
      ).insert();
      Concrete.create(
        this._db,
        IModel.dictionaryId,
        `${Concrete.className}${i}`
      ).insert();
      Steel.create(
        this._db,
        IModel.dictionaryId,
        `${Steel.className}${i}`
      ).insert();
    }
    this._db.saveChanges();
    this._db?.close();
  }
  public async InsertElement(filePath: string) {
    this._db = SnapshotDb.openFile(filePath);

    for (let i = 1; i <= 3; i++) {
      //   Aggregate.create(
      //     this._db,
      //     IModel.dictionaryId,
      //     `${Aggregate.className}${i}`
      //   ).insert();
      //   Aluminum.create(
      //     this._db,
      //     IModel.dictionaryId,
      //     `${Aluminum.className}${i}`
      //   ).insert();
      //   Asphalt.create(
      //     this._db,
      //     IModel.dictionaryId,
      //     `${Asphalt.className}${i}`
      //   ).insert();
      //   Concrete.create(
      //     this._db,
      //     IModel.dictionaryId,
      //     `${Concrete.className}${i}`
      //   ).insert();
      //   Steel.create(
      //     this._db,
      //     IModel.dictionaryId,
      //     `${Steel.className}${i}`
      //   ).insert();
    }
    // this._db.saveChanges();
    this._db.close();
  }
  private _db: SnapshotDb | undefined;
}

export async function Handle_PhysicalMaterialTest() {
  const filePath =
    "D:\\imodel-example\\presentation\\assets\\sample_documents\\PhysicalMaterialSchema.bim";
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
  let test = new PhysicalMaterialTest();
  await test.OpenSanapshotDB(filePath);
  //   await test.InsertElement(filePath);
}
