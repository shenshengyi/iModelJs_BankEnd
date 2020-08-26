import { LogLevel, Logger } from "@bentley/bentleyjs-core";
import { IModelVersion } from "@bentley/imodeljs-common";
import { MyAgent } from "./MyAgent";
import { loadAgentConfig } from "./AgentConfig";
import * as minimist from "minimist";
import { onAnyKey } from "onAnyKey";
import { IModelHost, ClassRegistry } from "@bentley/imodeljs-backend";
import { SnapshotDbExample_Handle } from "./DB_File/SnapshotDbExample";
import { TestSchema_Handle } from "./DB_File/TestSchema";
import {
  IModelTransformer_IModelImporter,
  IModelTransformer_Handle,
  IModelTransformer_Handle2,
} from "./DB_File/IModelTransformerTest";
class MM {
  public constructor() {
    console.log("开始");
  }
  public dispose(): void {
    console.log("结束");
  }
}

async function APP() {
  // Start the backend
  await IModelHost.startup();
  // await SnapshotDbExample_Handle();
  //await TestSchema_Handle();
  await IModelTransformer_Handle2();
  // await Handle_StandaloneDbTest();
  //await Handle_BriefcaseDbTest();
  // await Handle_SnapshotDbTest();

  //await TestAnalySis();
  // Handle_PhysicalMaterialTest();
  IModelHost.shutdown();
}
if (require.main === module) {
  APP();
}

// const argv = minimist(process.argv.slice(2));

// Logger.initializeToConsole();
// Logger.setLevelDefault(LogLevel.Error);

// console.log("MY AGENT STARTED");

// (async () => {
//   try {
//     // {
//     //   CONTEXT_ID: process.env.CONTEXT_ID,
//     //   IMODEL_ID: process.env.IMODEL_ID,
//     //   CLIENT_ID: process.env.CLIENT_ID,
//     //   CLIENT_SECRET: process.env.CLIENT_SECRET,
//     // }
//     const CONTEXT_ID = "";
//     const IMODEL_ID = "";
//     const CLIENT_ID = "";
//     const CLIENT_SECRET = "";

//     const config = loadAgentConfig();
//     const agent = new MyAgent(config);
//     await agent.initialize();

//     if (argv.latest) {
//       await agent.run();
//     } else if (argv.changeset) {
//       await agent.run(IModelVersion.asOfChangeSet(argv.changeset));
//     } else {
//       await agent.listen();
//       console.log(
//         "MY AGENT NOW LISTENING FOR HUB EVENTS -- press any key to stop"
//       );
//       await onAnyKey();
//     }

//     await agent.terminate();
//     console.log("MY AGENT FINISHED");
//   } catch (error) {
//     console.error(error, "Unhandled exception thrown in my-agent");
//     process.exitCode = 1;
//   }
// })();

// process.on("unhandledRejection", (_reason, promise) => {
//   console.error("Unhandled promise rejection at:", promise);
//   process.exitCode = 1;
// });
