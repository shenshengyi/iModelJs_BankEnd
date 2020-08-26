import {
  SnapshotDb,
  IModelTransformer,
  IModelJsFs,
  BackendRequestContext,
  Subject,
  IModelExporter,
  GeometricModel3d,
  Element,
  Sheet,
  IModelDb,
  ECSqlStatement,
  IModelImporter,
  GeometricModel2d,
  DrawingGraphic,
  IModelImportOptions,
  DefinitionPartition,
  Model,
  DefinitionModel,
  SubjectOwnsPartitionElements,
} from "@bentley/imodeljs-backend";
import {
  CreateIModelProps,
  IModel,
  ModelProps,
  Code,
  InformationPartitionElementProps,
  ElementProps,
} from "@bentley/imodeljs-common";
import { Id64String, DbResult, assert } from "@bentley/bentleyjs-core";

// export async function prepareTargetIModel(TargetIModel: IModelDb): Promise<void> {
//   // Import desired target schemas
//   const requestContext = new BackendRequestContext();
//   const sourceSchemaFileName: string = path.join(
//     KnownTestLocations.assetsDir,
//     "TestTransformerSource.ecschema.xml"
//   );
//   await TargetIModel.importSchemas(requestContext, [
//     FunctionalSchema.schemaFilePath,
//     sourceSchemaFileName,
//   ]);
//   FunctionalSchema.registerSchema();
// }

//用户自定义基类，重写若干基类函数，以实现自己的需求。
class MyIModelImporter extends IModelImporter {
  public constructor(targetDb: IModelDb, options?: IModelImportOptions) {
    super(targetDb, options);
  }
  //重写基类函数，当插入一个模型的时候被调用;
  protected onInsertModel(modelProps: ModelProps): Id64String {
    console.log("添加了一个model");
    return super.onInsertModel(modelProps);
  }
  //重写基类函数，当插入一个元素的时候被调用;
  protected onInsertElement(elementProps: ElementProps): Id64String {
    console.log("添加了一个元素,其class=" + elementProps.classFullName);
    return super.onInsertElement(elementProps);
  }
  //重写基类函数，当删除一个元素的时候被调用;
  protected onDeleteElement(elementId: Id64String): void {
    console.log("删除的元素的id为:" + elementId);
    super.onDeleteElement(elementId);
  }
}
export async function IModelTransformer_IModelImporter() {
  //首先创建一个测试imodel文件，因为使用openFile打开是只读的。
  //所以，我们通过createFrom基于种子imodel文件创建一个可读可写的iMode文件。
  const seedFileName = "./data3/CompatibilityTestSeed.bim";
  const seedDb = SnapshotDb.openFile(seedFileName);
  const sourceFileName = "./data3/TargetIModel.bim";
  if (IModelJsFs.existsSync(sourceFileName)) {
    IModelJsFs.removeSync(sourceFileName);
  }
  //注意，我们所创建的imodel文件设置了密码为'abcdef123456'.
  let TargetIModel = SnapshotDb.createFrom(seedDb, sourceFileName, {
    password: "abcdef123456",
  });
  //创建成功之后，即可关闭种子文件。
  seedDb.close();
  //检测一下，新创建的imodel文件是否可读可写。
  if (TargetIModel.isReadonly) {
    console.log("只读");
  } else {
    console.log("可读可写");
  }

  //创建一个MyIModelImporter实例，然后进行一下操作:
  const MyImporter = new MyIModelImporter(TargetIModel);

  const subjectId = TargetIModel.elements.getRootSubject().id;
  //创建两个建模元素分区属性;
  const partitionProps: InformationPartitionElementProps = {
    classFullName: DefinitionPartition.classFullName,
    model: IModel.repositoryModelId,
    parent: new SubjectOwnsPartitionElements(subjectId),
    code: DefinitionPartition.createCode(TargetIModel, subjectId, "AddModel"),
  };
  const partitionProps2: InformationPartitionElementProps = {
    classFullName: DefinitionPartition.classFullName,
    model: IModel.repositoryModelId,
    parent: new SubjectOwnsPartitionElements(subjectId),
    code: DefinitionPartition.createCode(TargetIModel, subjectId, "TestRemove"),
  };
  //先导入2个建模元素;
  const partitionId = MyImporter.importElement(partitionProps);
  const partitionId2 = MyImporter.importElement(partitionProps2);
  //创建一个DefinitionModel属性，注意其建模元素id是之前所插入的建模元素id。
  const modelProps: ModelProps = {
    classFullName: DefinitionModel.classFullName,
    modeledElement: { id: partitionId },
    id: partitionId,
    name: "TestModel",
  };
  MyImporter.importModel(modelProps);
  //删除id为partitionId2的建模元素。
  MyImporter.deleteElement(partitionId2);
  TargetIModel.close();
  //测试所插入的模型是否存在。
  const testDb = SnapshotDb.openFile(sourceFileName, {
    password: "abcdef123456",
  });
  const modelP = testDb.models.tryGetModelProps(partitionId);
  if (modelP) {
    console.log("测试成功");
    console.log(
      "name = " +
        modelProps.name +
        "classfullName = " +
        modelProps.classFullName
    );
  }
}
function count(iModelDb: IModelDb, classFullName: string): number {
  return iModelDb.withPreparedStatement(
    `SELECT COUNT(*) FROM ${classFullName}`,
    (statement: ECSqlStatement): number => {
      return DbResult.BE_SQLITE_ROW === statement.step()
        ? statement.getValue(0).getInteger()
        : 0;
    }
  );
}
export async function IModelTransformer_Handle() {
  //打开源imodel文件作为源;
  const SourceFileName = "./data3/CompatibilityTestSeed.bim";
  const SourceIModel = SnapshotDb.openFile(SourceFileName);
  //计算源imodel中元素个数;
  const ElementNumOfSource = count(SourceIModel, Element.classFullName);
  console.log("源 element 个数=" + ElementNumOfSource.toString()); //输出62

  //创建一个空imodel文件作为目标；
  const targetFileName = "./data3/TestTargetiModel.bim";
  if (IModelJsFs.existsSync(targetFileName)) {
    IModelJsFs.removeSync(targetFileName);
  }
  const targetDbProps: CreateIModelProps = {
    rootSubject: { name: "Clone-Target" },
    ecefLocation: SourceIModel.ecefLocation,
  };
  const targetDb = SnapshotDb.createEmpty(targetFileName, targetDbProps);
  //计算导入之前目的imodel中元素个数;
  const importBeforeNum = count(targetDb, Element.classFullName);
  console.log("import before number = " + importBeforeNum); //输出3

  // IModelExporter
  const expor = new IModelExporter(SourceIModel);
  // 统计DrawingGraphic的实例个数;
  const drawElementNumber = count(SourceIModel, DrawingGraphic.classFullName);
  console.log("DrawElementNumber = " + drawElementNumber.toString()); // 输出18；
  // 将DrawingGraphic的所有实例排除，也就是不导入到目标imodel中;
  expor.excludeElementClass(DrawingGraphic.classFullName);

  //IModelImporter
  const impor = new IModelImporter(targetDb);

  const transformer = new IModelTransformer(expor, impor);
  await transformer.processSchemas(new BackendRequestContext());
  //导入全部;
  transformer.processAll();
  transformer.dispose();
  //计算导入之后目的imodel中元素个数;
  const afterBeforeNum = count(targetDb, Element.classFullName);
  console.log("import after number = " + afterBeforeNum); //输出44,其中18个DrawingGraphic的实例没有导入。
  SourceIModel.close();
  targetDb.close();
}

export async function IModelTransformer_Handle2() {
  const SourceFileName1 = "./data2/Baytown.bim";
  const sourceFileName2 = "./data2/house.bim";
  const SrouceModel1 = SnapshotDb.openFile(SourceFileName1);
  const SrouceModel2 = SnapshotDb.openFile(sourceFileName2);
  //导入之前，分别计算2个源imodel中element的个数并打印;
  const num1 = count(SrouceModel1, Element.classFullName);
  const num2 = count(SrouceModel2, Element.classFullName);
  console.log("num1 = " + num1.toString()); //输出4962
  console.log("num2 = " + num2.toString()); //输出3169
  //创建一个新的imodel作为目标imodel,然后将2个源imodel导入到目标imodel中;
  const targetFileName = "./data2/TestTargetiModel.bim";
  if (IModelJsFs.existsSync(targetFileName)) {
    IModelJsFs.removeSync(targetFileName);
  }
  const targetDbProps: CreateIModelProps = {
    rootSubject: { name: "Clone-Target" },
  };
  const targetDb = SnapshotDb.createEmpty(targetFileName, targetDbProps);
  //在目标imodel中targetDb中创建2个分区，分别容纳2个源imodel;
  const parentSubject = targetDb.elements.getRootSubject().id;
  const subjectId1 = Subject.insert(targetDb, parentSubject, "subject1");
  const subjectId2 = Subject.insert(targetDb, parentSubject, "subject2");

  const rc = new BackendRequestContext();
  //注意在导入的时候，如果提示 UnhandledPromiseRejectionWarning: Schema Upgrade Failed: Error importing schema
  //可以尝试改变导入的imodel的顺序，这也就是为什么这里先导入2，再导入1的原因。
  //开始创建导入transformer2;
  const transformer2 = new IModelTransformer(SrouceModel2, targetDb, {
    targetScopeElementId: subjectId2,
  });
  await transformer2.processSchemas(rc);
  //导入全部;
  transformer2.processAll();
  transformer2.dispose();
  //开始创建导入transformer1;
  const transformer1 = new IModelTransformer(SrouceModel1, targetDb, {
    targetScopeElementId: subjectId1,
  });
  await transformer1.processSchemas(rc);
  //导入全部;
  transformer1.processAll();
  transformer1.dispose();
  //计算导入后目标imodel中element的个数
  const num = count(targetDb, Element.classFullName);
  console.log("num = " + num.toString()); //输出8128
  SrouceModel1.close();
  SrouceModel2.close();
  targetDb.close();
}
