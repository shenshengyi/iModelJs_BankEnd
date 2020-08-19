import {
  SnapshotDb,
  ECSqlStatement,
  DisplayStyle3d,
  DocumentListModel,
  GenericDocument,
} from "@bentley/imodeljs-backend";
import {
  SpatialViewDefinitionProps,
  ModelSelectorProps,
  CategorySelectorProps,
  DbResult,
  ColorDef,
  ViewFlags,
  RenderMode,
  DisplayStyleProps,
  IModel,
  DisplayStyleSettingsProps,
  BisCodeSpec,
  Code,
} from "@bentley/imodeljs-common";
import { Id64String, IModelStatus } from "@bentley/bentleyjs-core";
class SnapshotDbTest {
  public constructor(filePath: string) {
    this._filePath = filePath;
  }
  public OpenSnapshotDbTest() {
    this._db = SnapshotDb.openFile(this._filePath);
    console.log(this._db.filePath);
    this._db.close();
  }

  public createSnapshotFromSeed(
    testFileName: string,
    seedFileName: string
  ): SnapshotDb {
    const seedDb: SnapshotDb = SnapshotDb.openFile(seedFileName);
    const testDb: SnapshotDb = SnapshotDb.createFrom(seedDb, testFileName);
    seedDb.close();
    return testDb;
  }

  public async QueryElement2() {
    const SeedPath = "D:\\imodel-example\\backend\\data\\GenericTest.bim";
    const filePath = "D:\\imodel-example\\backend\\data\\NBA.bim";
    const db = this.createSnapshotFromSeed(filePath, SeedPath);
    // const sql = `select ECInstanceId from ${Element.classFullName}`;

    let settings: DisplayStyleSettingsProps = {
      backgroundColor: ColorDef.blue.toJSON(),
      excludedElements: undefined,
      viewflags: ViewFlags.fromJSON({
        renderMode: RenderMode.SolidFill,
      }),
    };
    let props: DisplayStyleProps = {
      classFullName: DisplayStyle3d.classFullName,
      model: IModel.dictionaryId,
      code: { spec: BisCodeSpec.displayStyle, scope: IModel.dictionaryId },
      isPrivate: false,
      jsonProperties: {
        styles: settings,
      },
    };

    let txns = db.txns;
    txns.beginMultiTxnOperation();
    const current = txns.getCurrentTxnId();
    // let elementIds: Id64String[] = [];
    // db.withPreparedStatement(sql, (statement: ECSqlStatement): void => {
    //   while (DbResult.BE_SQLITE_ROW === statement.step()) {
    //     elementIds.push(statement.getValue(0).getId());
    //   }
    // });
    // const now = txns.getCurrentTxnId();
    // const re = txns.reverseTo(txns.queryPreviousTxnId(now));
    // console.log("re = " + re.toString());
    // if (IModelStatus.Success == re) {
    //   console.log("回退成功");
    // } else {
    //   console.log("回退失败");
    // }
    // const e = db.elements.tryGetElementProps(id);
    // if (e) {
    //   console.log("可以找到插入的元素");
    // } else {
    //   console.log("找不到插入的元素");
    // }
    const documentListModelId: Id64String = DocumentListModel.insert(
      db,
      IModel.rootSubjectId,
      "Test DocumentListModel"
    );
    const documentProps = {
      classFullName: GenericDocument.classFullName,
      model: documentListModelId,
      code: Code.createEmpty(),
      userLabel: "BeiJing",
    };
    const graphicId: Id64String = db.elements.insertElement(documentProps);
    const r = txns.reverseSingleTxn();
    if (IModelStatus.Success == r) {
      console.log("回退成功");
    } else {
      console.log("回退失败");
    }
    const e = db.elements.tryGetElementProps(graphicId);
    if (e) {
      console.log(e.classFullName);
    }
    const re = txns.cancelTo(current);
    if (txns.checkUndoPossible()) {
      console.log("可以撤销");
    } else {
      console.log("不可以撤销");
    }
    if (IModelStatus.Success == re) {
      console.log("回退成功");
    } else {
      console.log("回退失败");
    }
    txns.endMultiTxnOperation();
    db.saveChanges("添加文档");
    db.close();
  }
  public async QueryElement() {
    this._db = SnapshotDb.openFile(this._filePath);
    console.log(this._db.filePath);

    const idList: string[] = [
      "0x1",
      "0xe",
      "0x10",
      "0x14c",
      "0x15",
      "0x16",
      "0x17",
      "0x40",
      "0x27a",
      "0x27b",
      "0xc56",
    ];
    for (const id of idList) {
      const m = this._db.models.tryGetModel(id);
      if (m) {
        console.log(m.name);
      }
    }
    //"BisCore.SpatialViewDefinition"
    const viewList = this._db.views.queryViewDefinitionProps();
    console.log("view size = " + viewList.length.toString());
    for (const view of viewList) {
      const e:
        | SpatialViewDefinitionProps
        | undefined = this._db.elements.tryGetElementProps<
        SpatialViewDefinitionProps
      >(view.id!.toString());
      if (e) {
        console.log(e.code.value);
        if (e.categorySelectorId) {
          const selectCategory:
            | CategorySelectorProps
            | undefined = this._db.elements.tryGetElementProps<
            CategorySelectorProps
          >(e.categorySelectorId);
          for (const id of selectCategory!.categories) {
            console.log("category = " + id);
          }
        }
        if (e.modelSelectorId) {
          const selectModel:
            | ModelSelectorProps
            | undefined = this._db.elements.tryGetElementProps<
            ModelSelectorProps
          >(e.modelSelectorId);
          if (selectModel) {
            for (const id of selectModel.models) {
              console.log("model = " + id);
            }
          }
        }
      }
    }

    this._db.close();
  }
  public async QueryElement3() {
    const filePath = "D:\\imodel-example\\backend\\data\\test.bim";
    const db: SnapshotDb = SnapshotDb.openFile(filePath);
    if (db) {
      console.log(db.filePath);
    }
    if (db.isReadonly) {
      console.log("文件是只读的");
    } else {
      console.log("文件可读可写");
    }
    // const sql = "select * from bis.Model";
    // let modelIds: Id64String[] = [];
    // db.withPreparedStatement(sql, (statement: ECSqlStatement): void => {
    //   while (DbResult.BE_SQLITE_ROW === statement.step()) {
    //     modelIds.push(statement.getValue(0).getId());
    //   }
    // });
    // console.log("model size = " + modelIds.length.toString());
    // for (const id of modelIds) {
    //   const m = db.models.tryGetModelProps(id);
    //   if (m) {
    //     console.log(m);
    //   }
    // }
    const mp: Map<string, string[]> = new Map<string, string[]>();
    const sqlE = "select * from bis.Element";
    const elementIds: string[] = [];
    db.withPreparedStatement(sqlE, (statement: ECSqlStatement): void => {
      while (DbResult.BE_SQLITE_ROW == statement.step()) {
        elementIds.push(statement.getValue(0).getId());
      }
    });

    for (const id of elementIds) {
      const e = db.elements.getElementProps(id);
      if (e) {
        if (mp.has(e.model)) {
          mp.get(e.model)?.push(id);
        } else {
          mp.set(e.model, [id]);
        }
      }
    }

    db.close();
  }
  private _filePath: string;
  private _db: SnapshotDb | undefined;
}
async function Handle_SnapshotDbTest() {
  //const filePath = "D:\\imodel-example\\backend\\data\\house.bim";
  const filePath = "../data/Baytown.bim";
  const test = new SnapshotDbTest(filePath);
  await test.QueryElement();
  await test.QueryElement3();
}

export { Handle_SnapshotDbTest };
