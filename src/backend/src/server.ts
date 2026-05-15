import { App } from "./app";
//import initializeFirebase from "./config/firebase.config";

async function main() {
  try {

    //initializeFirebase();

    const app = new App();
    await app.listen();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
