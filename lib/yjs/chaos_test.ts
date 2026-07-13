import * as Y from 'yjs';
import { RedisPersistence } from './redis-adapter';
import { Redis } from 'ioredis';

async function runChaos() {
  console.log("Starting Phase 14: Concurrent Chaos Protocol...");

  // Cleanup Redis first
  const redis = new Redis();
  await redis.del('yjs:updates:workspace_alpha');
  await redis.del('yjs:doc:workspace_alpha');

  const persistence = new RedisPersistence();

  // Initialize server-side document
  const serverDoc = new Y.Doc();
  await persistence.bindState('workspace_alpha', serverDoc);

  const serverText = serverDoc.getText('content');
  serverText.insert(0, "Initial content.\n");

  console.log(`[ATOMIC LOG] Initial server state: "${serverText.toString()}"`);

  // Simulate 10 concurrent actors (5 humans, 5 AI agents)
  const actors = Array.from({ length: 10 }, (_, i) => {
    const doc = new Y.Doc();
    const type = i < 5 ? 'Human' : 'Agent';
    return { id: `Actor_${i}_${type}`, doc, text: doc.getText('content') };
  });

  // Sync initial state to all actors
  const stateVector = Y.encodeStateVector(serverDoc);
  const diff = Y.encodeStateAsUpdate(serverDoc);

  for (const actor of actors) {
    Y.applyUpdate(actor.doc, diff);
  }

  // Define chaos actions
  const actions = actors.map((actor, index) => {
    return new Promise<void>(async (resolve) => {
      // Add random jitter 0-500ms
      await new Promise(r => setTimeout(r, Math.random() * 500));

      const isOffline = index % 3 === 0; // Disconnect 3 actors (0, 3, 6, 9)

      if (isOffline) {
        console.log(`[ATOMIC LOG] ${actor.id} disconnected. Working offline...`);
      }

      actor.text.insert(0, `Edit by ${actor.id} at index 0.\n`);

      const update = Y.encodeStateAsUpdate(actor.doc);

      if (!isOffline) {
        console.log(`[ATOMIC LOG] ${actor.id} syncing update online.`);
        Y.applyUpdate(serverDoc, update);
      } else {
        // Reconnect after 500ms and sync
        setTimeout(() => {
          console.log(`[ATOMIC LOG] ${actor.id} reconnecting and merging offline edits...`);
          Y.applyUpdate(serverDoc, update);
          resolve();
        }, 500);
        return; // Don't resolve yet
      }
      resolve();
    });
  });

  await Promise.all(actions);

  // Wait for pubsub propagation
  await new Promise(r => setTimeout(r, 1000));

  console.log("\n[ATOMIC LOG] Chaos Simulation Complete.");
  console.log("Final Document State:");
  console.log("------------------------");
  console.log(serverText.toString());
  console.log("------------------------");

  console.log("Verifying persistence...");

  // Test persistence loading
  const newPersistence = new RedisPersistence();
  const recoveredDoc = new Y.Doc();
  await newPersistence.bindState('workspace_alpha', recoveredDoc);

  const recoveredText = recoveredDoc.getText('content');
  if (recoveredText.toString() === serverText.toString()) {
    console.log("[ATOMIC LOG] Redis persistence verification: SUCCESS. Document states match.");
  } else {
    console.log("[ATOMIC LOG] Redis persistence verification: FAILED. States mismatch.");
  }

  await persistence.close();
  await newPersistence.close();
  await redis.quit();
}

runChaos().catch(console.error);
