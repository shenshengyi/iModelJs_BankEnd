import {
  SnapshotDb,
  BackendRequestContext,
  Model,
  DefinitionModel,
  SpatialCategory,
  PhysicalModel,
  DocumentListModel,
  Drawing,
  IModelDb,
  ModelSelector,
  DisplayStyle3d,
  CategorySelector,
  OrthographicViewDefinition,
} from "@bentley/imodeljs-backend";
import { Id64String, Id64Array } from "@bentley/bentleyjs-core";
import {
  IModel,
  SubCategoryAppearance,
  ColorDef,
  Code,
  GeometryStreamProps,
  GeometryStreamBuilder,
  GeometricElement3dProps,
  GeometryParams,
  ViewFlags,
  RenderMode,
} from "@bentley/imodeljs-common";
import {
  Point3d,
  Vector3d,
  Box,
  YawPitchRollAngles,
  Range3d,
} from "@bentley/geometry-core";

class TestSchema {
  public constructor() {
    this._imodel = undefined;
  }
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
  public async dispose() {
    if (this._imodel != undefined) {
      this._imodel.close();
    }
  }

  public async Handle() {
    if (this._imodel == undefined) {
      return;
    }
    //导入Schema.
    const schemaPath = "./data/RobotWorld.ecschema.xml";
    let imodel = this._imodel;
    imodel.importSchemas(this.requestContext, [schemaPath]);

    //插入一个物理模型并将其命名为My_PhysicalModel，将其作为后面新增Element的容器。
    const MyPhysicalModelId = PhysicalModel.insert(
      imodel,
      IModelDb.rootSubjectId,
      "My_PhysicalModel"
    );
    //插入一个定义模型并将其命名为My_DefinitionModel,将其作为后面新增Element的容器。
    const MyDefinitionModelId = DefinitionModel.insert(
      imodel,
      IModelDb.rootSubjectId,
      "DefinitionModel"
    );

    //创建一个Category命名为My_Category,并将其插入到DefinitionModel中。
    const color = ColorDef.red;
    const appearance: SubCategoryAppearance.Props = {
      color: color.toJSON(),
      transp: 0,
      invisible: false,
    };

    const CategoryId = SpatialCategory.insert(
      imodel,
      MyDefinitionModelId,
      "My_Category",
      appearance
    );

    //根据Schema中Robot的定义，添加一个接口，以限制所创建实例的属性。
    interface MyRobotProp extends GeometricElement3dProps {
      radius: number;
    }

    //填充实例属性;My_Robot
    const My_Robot: MyRobotProp = {
      classFullName: "RobotWorld:Robot",
      code: Code.createEmpty(),
      category: CategoryId,
      geom: createBox(Point3d.create(1, 1, 1)),
      radius: 99,
      userLabel: "This is an Child.",
      placement: {
        origin: Point3d.createZero(),
        angles: YawPitchRollAngles.createDegrees(0, 0, 0),
        bbox: Range3d.fromJSON(),
      },
      model: MyPhysicalModelId, //该Element将要放入Model的Model的ID。
    };
    //将创建的Element实例插入到iModel中。
    imodel.elements.insertElement(My_Robot);

    //创建一个Model选择器并将其命名为My_ModelSelector，然后插入到iModel中，以供视图中使用。
    const modelSelectorId = ModelSelector.insert(
      imodel,
      MyDefinitionModelId,
      "My_ModelSelector",
      [MyPhysicalModelId] //所选择的Model的Id的列表。
    );

    //创建DisplayStyle3d,并将其插入到定义模型中，以供视图中使用。
    //将以不同的属性设置创建3个不同的DisplayStyle3d的实例以供3个视图中分别使用。
    const displayStyleIds: Id64Array = [];

    //创建第一个DisplayStyle3d的实例并命名为My_DisplayStyle3d_1,然后将其插入到定义模型中。
    const vf1 = new ViewFlags();
    const bgColor1 = ColorDef.red; // White background...
    vf1.renderMode = RenderMode.SolidFill; // SolidFill rendering ... no lighting etc.
    vf1.visibleEdges = true;
    vf1.shadows = true;
    vf1.grid = true;
    vf1.acsTriad = true;
    vf1.cameraLights = true;
    vf1.weights = true;
    displayStyleIds.push(
      DisplayStyle3d.insert(
        imodel,
        MyDefinitionModelId,
        "My_DisplayStyle3d_1",
        {
          viewFlags: vf1,
          backgroundColor: bgColor1,
        }
      )
    );

    //创建第二个DisplayStyle3d的实例并命名为My_DisplayStyle3d_2,然后将其插入到定义模型中。
    const vf2 = new ViewFlags();
    vf2.fill = true;
    vf2.renderMode = RenderMode.SmoothShade;
    const bgColor2 = ColorDef.blue; // White background...
    displayStyleIds.push(
      DisplayStyle3d.insert(
        imodel,
        MyDefinitionModelId,
        "My_DisplayStyle3d_2",
        {
          viewFlags: vf2,
          backgroundColor: bgColor2,
        }
      )
    );
    //创建第三个DisplayStyle3d的实例并命名为My_DisplayStyle3d_2,然后将其插入到定义模型中。
    const vf3 = new ViewFlags();
    vf3.fill = true;
    vf3.renderMode = RenderMode.SolidFill;
    const bgColor3 = ColorDef.green; // White background...
    displayStyleIds.push(
      DisplayStyle3d.insert(
        imodel,
        MyDefinitionModelId,
        "My_DisplayStyle3d_3",
        {
          viewFlags: vf3,
          backgroundColor: bgColor3,
        }
      )
    );
    //创建一个Category选择器并命名为My_CategorySelector,然后将其插入到定义模型中，以供视图中使用。
    const categorySelectorId = CategorySelector.insert(
      imodel,
      MyDefinitionModelId,
      "My_CategorySelector",
      [CategoryId]
    );

    //依次创建3个ViewDefinition的实例，并将其插入到定义模型中，以作为视图显示的内容。
    const r = new Range3d(0, 0, 0, 5, 5, 5);
    OrthographicViewDefinition.insert(
      imodel,
      MyDefinitionModelId,
      "My_View1",
      modelSelectorId,
      categorySelectorId,
      displayStyleIds[0],
      r
    );
    OrthographicViewDefinition.insert(
      imodel,
      MyDefinitionModelId,
      "My_View2",
      modelSelectorId,
      categorySelectorId,
      displayStyleIds[1],
      r
    );
    OrthographicViewDefinition.insert(
      imodel,
      MyDefinitionModelId,
      "My_View3",
      modelSelectorId,
      categorySelectorId,
      displayStyleIds[2],
      r
    );
  }

  private requestContext = new BackendRequestContext();
  private _imodel: SnapshotDb | undefined;
}
export function createBox(
  size: Point3d,
  categoryId?: Id64String,
  subCategoryId?: Id64String,
  renderMaterialId?: Id64String,
  geometryPartId?: Id64String
): GeometryStreamProps {
  const geometryStreamBuilder = new GeometryStreamBuilder();
  if (undefined !== categoryId && undefined !== subCategoryId) {
    geometryStreamBuilder.appendSubCategoryChange(subCategoryId);
    if (undefined !== renderMaterialId) {
      const geometryParams = new GeometryParams(categoryId, subCategoryId);
      geometryParams.materialId = renderMaterialId;
      geometryStreamBuilder.appendGeometryParamsChange(geometryParams);
    }
  }
  geometryStreamBuilder.appendGeometry(
    Box.createDgnBox(
      Point3d.createZero(),
      Vector3d.unitX(),
      Vector3d.unitY(),
      new Point3d(0, 0, size.z),
      size.x,
      size.y,
      size.x,
      size.y,
      true
    )!
  );

  if (undefined !== geometryPartId) {
    geometryStreamBuilder.appendGeometryPart3d(geometryPartId);
  }
  return geometryStreamBuilder.geometryStream;
}
export async function TestSchema_Handle() {
  let example = new TestSchema();
  const seedFileName = "./data/test.bim";
  const testFileName = "./data/TestMyiModel.bim";
  await example.CreateIModelFromSeed(seedFileName, testFileName);
  example.Handle();

  await example.dispose();
}
