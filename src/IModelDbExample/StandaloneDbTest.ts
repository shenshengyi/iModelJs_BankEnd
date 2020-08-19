import * as fs from "fs-extra";
import * as path from "path";
import {
  StandaloneDb,
  BackendRequestContext,
  DefinitionModel,
  IModelDb,
  BriefcaseDb,
  BriefcaseManager,
  PhysicalObject,
  PhysicalModel,
  Category,
  DrawingCategory,
  GenericGraphicalType2d,
  DrawingModel,
  SpatialLocationModel,
  PhysicalPartition,
  SubjectOwnsPartitionElements,
  SpatialCategory,
} from "@bentley/imodeljs-backend";

import { OpenMode, Id64String } from "@bentley/bentleyjs-core";
import {
  Code,
  DefinitionElementProps,
  CreateEmptyStandaloneIModelProps,
  PhysicalElementProps,
  GeometryStreamBuilder,
  TypeDefinitionElementProps,
  SubCategoryAppearance,
  ColorDef,
  IModel,
  ElementProps,
  CodeProps,
} from "@bentley/imodeljs-common";
import {
  Arc3d,
  Point3d,
  YawPitchRollAngles,
  LineSegment3d,
} from "@bentley/geometry-core";

interface CustomElementProp extends DefinitionElementProps {
  city: string;
  amount: number;
}

class StandaloneDbTest {
  public static createAndInsertPhysicalPartition(
    testDb: IModelDb,
    newModelCode: CodeProps,
    parentId?: Id64String
  ): Id64String {
    const model = parentId
      ? testDb.elements.getElement(parentId).model
      : IModel.repositoryModelId;
    const parent = new SubjectOwnsPartitionElements(
      parentId || IModel.rootSubjectId
    );

    const modeledElementProps: ElementProps = {
      classFullName: PhysicalPartition.classFullName,
      parent,
      model,
      code: newModelCode,
    };
    const e: ElementProps = testDb.elements.createElement(modeledElementProps);
    return testDb.elements.insertElement(e);
  }
  public constructor(filePath: string) {
    this._FilePath = filePath;
    this._db = undefined;
  }

  public async CreateStandaloneDb() {
    if (fs.existsSync(this._FilePath)) {
      fs.removeSync(this._FilePath);
    }

    const prop: CreateEmptyStandaloneIModelProps = {
      rootSubject: {
        name: "StandaloneDbTest",
        description: "Test the Standalone",
      },
    };

    //创建空的StandaloneDb数据文件;
    this._db = StandaloneDb.createEmpty(this._FilePath, prop);

    //导入自定义schema;
    const SchemaFilePath =
      "D:\\iModel-Study\\console-imodel\\TestBim.ecschema.xml";
    const requestContext = new BackendRequestContext();
    await this._db.importSchemas(requestContext, [SchemaFilePath]);
    console.log("schema 版本 = " + this._db.querySchemaVersion("TestBim"));
    console.log("DB 文件路径=" + this._db.filePath);
    this._db.close();
  }
  public async InsertElement() {
    this._db = StandaloneDb.openFile(this._FilePath, OpenMode.ReadWrite);
    if (this._db.isOpen) {
      console.log("db文件已经打开");
      if (this._db.isReadonly) {
        console.log("db文件只可以读");
      } else {
        console.log("db文件可读可写");
      }
    } else {
      console.log("db文件没有打开");
    }

    const newModelId: string = DefinitionModel.insert(
      this._db,
      IModelDb.rootSubjectId,
      "Test_DefinitionModel"
    );
    const elementProp0: CustomElementProp = {
      classFullName: "TestBim:TestPhysicalElement",
      city: "北京",
      amount: 1500,
      model: newModelId,
      code: { ...Code.createEmpty(), value: "element_0" },
    };

    const elementProp1: CustomElementProp = {
      classFullName: "TestBim:TestPhysicalElement",
      city: "洛杉矶",
      amount: 2000,
      model: newModelId,
      code: { ...Code.createEmpty(), value: "element_1" },
    };
    this._db.elements.insertElement(elementProp0);
    this._db.elements.insertElement(elementProp1);

    const categoryId = SpatialCategory.insert(
      this._db,
      newModelId,
      "GeoJSON Feature",
      { color: ColorDef.black.tbgr, fill: ColorDef.red.tbgr }
    );

    const modelId = PhysicalModel.insert(
      this._db,
      IModelDb.rootSubjectId,
      "CustomGeomtryModel"
    );
    const builder = new GeometryStreamBuilder();
    const pointS = Point3d.createZero();
    const pointE = Point3d.create(5, 0, 0);
    builder.appendGeometry(LineSegment3d.create(pointS, pointE));
    const geometry = builder.geometryStream;

    pointS.y += 0.5;
    pointE.y += 0.5;
    const props: PhysicalElementProps = {
      classFullName: "Generic:PhysicalObject",
      model: modelId,
      code: Code.createEmpty(),
      category: categoryId,
      geom: geometry,
    };
    this._db.elements.insertElement(props);
    this._db.close();
  }
  public async QueryElement() {
    this._db = StandaloneDb.openFile(this._FilePath, OpenMode.Readonly);
    const IDSet = this._db.queryEntityIds({
      from: "TestBim:TestPhysicalElement",
    });
    for (const id of IDSet) {
      console.log("查询到id = " + id);
      const e:
        | CustomElementProp
        | undefined = this._db.elements.tryGetElementProps<CustomElementProp>(
        id
      );
      if (e) {
        console.log("city = " + e.city);
        console.log("amount = " + e.amount);
      }
    }
    this._db.close();
  }
  private _FilePath: string;
  private _db: StandaloneDb | undefined;
}
async function Handle_StandaloneDbTest() {
  const filePath = "D:\\imodel-example\\backend\\data\\StandaloneDbTest.bim";
  let test = new StandaloneDbTest(filePath);
  /*创建StandaloneDb数据文件*/
  await test.CreateStandaloneDb();
  /*测试向model中插入元素*/
  await test.InsertElement();
  /*测试查询元素*/
  await test.QueryElement();
}

export { Handle_StandaloneDbTest };
