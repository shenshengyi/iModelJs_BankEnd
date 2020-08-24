import {
  SnapshotDb,
  Model,
  Element,
  GeometricElement,
  GeometricModel,
  DrawingModel,
  SpatialElement,
  Subject,
  SubjectOwnsSubjects,
  InformationPartitionElement,
  LinkModel,
  LinkPartition,
  DocumentPartition,
  DocumentListModel,
  GeometricElement3d,
} from "@bentley/imodeljs-backend";
import * as fs from "fs";
import * as path from "path";
import { IModelDb, ECSqlStatement } from "@bentley/imodeljs-backend";
import { Id64String, DbResult } from "@bentley/bentleyjs-core";

class SnapshotDbExample {
  public constructor(filePath: string) {
    this._filePath = filePath;
    this._imodel = undefined;
  }
  public openIModel() {
    this._imodel = SnapshotDb.openFile(this._filePath);
    if (this._imodel) {
      console.log(this._filePath + " 打开成功");
      return true;
    } else {
      console.log(this._filePath + " 打开失败");
      return false;
    }
  }
  public dispose() {
    if (this._imodel != undefined) {
      this._imodel.close();
      console.log(this._filePath + " 关闭成功");
    }
  }
  public async QueryIModel() {
    if (this._imodel == undefined) {
      return;
    }
    const imodel = this._imodel;
    const modelIdSet = imodel.queryEntityIds({
      from: Model.classFullName,
    });
    console.log("个数=" + modelIdSet.size.toString());
    for (const id of modelIdSet.values()) {
      const prop = imodel.elements.tryGetElementProps(id);
      if (prop) {
        console.log(prop);
      }
    }
    // {
    //   const modelIdSet = imodel.queryEntityIds({ from: Element.classFullName });
    //   console.log(modelIdSet.size.toString());
    //   for (const id of modelIdSet) {
    //     const prop = imodel.elements.tryGetElementProps(id);
    //     if (prop) {
    //       if (prop.parent) {
    //         console.log(
    //           prop.classFullName + "-------" + prop.parent.relClassName
    //         );
    //       }
    //     }
    //   }
    //   //   for (const modelId of modelIdSet.values()) {
    //   //     const modelProp = imodel.models.tryGetModelProps(modelId);
    //   //     if (modelProp != undefined) {
    //   //       // console.log(modelProp);
    //   //     }
    //   //   }
    // }
    // console.log(imodel);
    // /* 1.查询该imodel数据文件在本地的路径;*/
    // const filePath = imodel.filePath;
    // console.log(imodel.filePath);

    // /* 2.查询该imodel可读性*/
    // if (imodel.isReadonly) {
    //   console.log("只读");
    // } else {
    //   console.log("可读可写");
    // }

    // /* 3.查询该imodel中所有的model*/
    // {
    //   const modelIdSet = imodel.queryEntityIds({ from: Model.classFullName });
    //   for (const modelId of modelIdSet.values()) {
    //     const modelProp = imodel.models.tryGetModelProps(modelId);
    //     if (modelProp != undefined) {
    //       // console.log(modelProp);
    //     }
    //   }
    // }
    // /* 4.查询该imodel中所有的GeometricModel*/
    // {
    //   const modelIdSet = imodel.queryEntityIds({
    //     from: GeometricModel.classFullName,
    //   });
    //   for (const modelId of modelIdSet.values()) {
    //     const modelProp = imodel.models.tryGetModel(modelId);
    //     if (modelProp != undefined) {
    //       // console.log(modelProp);
    //     }
    //   }
    // }
    // /* 5. 查询该imodel中所有的DrawingModel*/
    // {
    //   const sql = `select * from ${DrawingModel.classFullName}`;
    //   imodel.withPreparedStatement(sql, (statement: ECSqlStatement) => {
    //     while (DbResult.BE_SQLITE_ROW === statement.step()) {
    //       console.log(statement.getRow().id);
    //     }
    //   });
    // }
    // /* 6.根据已知Element Id查询其属性值。*/
    // {
    //   /*
    //     注:id为0x300000002f5的Element的属性如下所示:
    //     {
    //     classFullName: 'ProcessFunctional:SIGNALLINE',
    //     code: { scope: '0x1', spec: '0x1', value: '' },
    //     federationGuid: '4cc96158-0484-47dd-bffe-447c1b4e422e',
    //     id: '0x300000002f5',
    //     model: '0x20000000001',
    //     openPlantTypeName: 'INSTLINE_ELECTRIC',
    //     pLANT_AREA: '50',
    //     sERVICE: 'HPS',
    //     sYSTEM: 'SW',
    //     uNIT: '1',
    //     userLabel: 'IL'
    //     }
    //     */
    //   const elementProp = imodel.elements.tryGetElementProps("0x300000002f5");
    //   if (elementProp) {
    //     console.log((elementProp as any).pLANT_AREA); //将输出50
    //   }
    // }

    // //查询imodel 文件路径；
    // const filePath = this._imodel.filePath;
    // console.log("文件路径=" + filePath);
    // //查询imodel文件是可读可写
    // if (this._imodel.isReadonly) {
    //   console.log("imodel是只读的");
    // } else {
    //   console.log("imodel可读可写");
    // }
    //查询iModel中的模型;
    // const IdSet = this._imodel.queryEntityIds({ from: Element.classFullName });
    // console.log(IdSet.size);
    // for (const id of IdSet.values()) {
    //   const modelProp = this._imodel.models.tryGetModelProps(id);
    //   if (modelProp != undefined) {
    //     console.log(modelProp);
    //     // modelProp.toString();
    //     // fs.appendFileSync("d:/data.xml", JSON.stringify(modelProp));
    //     // fs.appendFileSync("d:/data.xml", "\n");
    //   }
    // }
    // const IdSet = this._imodel.queryEntityIds({
    //   from: "ProcessFunctional:SIGNALLINE",
    //   where: "Model.Id=0x20000000001",
    // });
    // const r = this._imodel.containsClass("ProcessFunctional:SIGNALLINE");
    // if (r) {
    //   console.log("包含" + "ProcessFunctional:SIGNALLINE");
    // } else {
    //   console.log("没包含" + "ProcessFunctional:SIGNALLINE");
    // }
    // const JSClass = this._imodel.getJsClass("ProcessFunctional:SIGNALLINE");
    // console.log(JSClass);
    // console.log("size = " + IdSet.size.toString());
    // let jsClass: string;
    // for (const id of IdSet.values()) {
    //   const prop = this._imodel.elements.tryGetElement(id);
    //   if (prop) {
    //     // console.log(prop);
    //     jsClass = prop.classFullName;
    //     console.log(jsClass);

    //     break;
    //   }

    // const sql = "select * from ProcessFunctional:SIGNALLINE";
    // for await (const row of this._imodel.query(sql)) {
    //   console.log(row);
    // }
    // const p = this._imodel.elements.tryGetElementProps("0x300000002f5");
    // if (p) {
    //   //   const jc = this._imodel.getJsClass(p.classFullName);
    //   //   const gm = this._imodel.getMetaData(p.classFullName);

    //   console.log((p as any).sERVICE);
    //   //   console.log(jc.classFullName);
    //   //   console.log(jc);
    //   //   console.log(p);
    // }
    // const modelId: Id64String = IModelDb.repositoryModelId;
    // this._imodel.withPreparedStatement(
    //   `SELECT * FROM ProcessFunctional:SIGNALLINE`,
    //   (statement: ECSqlStatement) => {
    //     // statement.bindId("modelId", modelId);
    //     while (DbResult.BE_SQLITE_ROW === statement.step()) {
    //       console.log(statement.getRow().sYSTEM);
    //     }
    //   }
    // );
    // console.log(Element.classFullName);
  }
  private _filePath: string;
  private _imodel: SnapshotDb | undefined;
}
export async function SnapshotDbExample_Handle() {
  const filePath = "../data/Baytown.bim";
  const example = new SnapshotDbExample(filePath);
  if (example.openIModel()) {
    await example.QueryIModel();
    example.dispose();
  }
}
