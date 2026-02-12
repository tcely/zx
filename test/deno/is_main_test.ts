import { assertEquals } from "jsr:@std/assert";
import { isMain } from "../../src/util.ts";

Deno.test("isMain - Runtime explicit 'false' (Deno/Bun Library)", () => {
  // If the runtime says it is false, we should return false 
  // and never even check the scriptPath.
  const mockMeta = { main: false, url: "file:///app/lib.ts" } as any;
  const entryPath = "/app/lib.ts"; // Same path, but meta.main says NO
  
  assertEquals(
    isMain(mockMeta, entryPath), 
    false, 
    "Should return false if meta.main is explicitly false (ignoring path match)"
  );
});

Deno.test("isMain - Runtime explicit 'true' (Deno/Bun CLI)", () => {
  const mockMeta = { main: true, url: "file:///app/cli.ts" } as any;
  assertEquals(isMain(mockMeta), true, "Should return true if meta.main is true");
});

Deno.test("isMain - Runtime 'undefined' (Node.js Fallback)", () => {
  // In Node.js, meta.main is undefined.
  // The function MUST proceed to path comparison.
  const moduleUrl = "file:///app/cli.ts";
  const scriptPath = "/app/cli.ts";
  
  const mockMeta = { url: moduleUrl } as ImportMeta; // No .main property

  assertEquals(
    isMain(mockMeta, scriptPath), 
    true, 
    "Should fallback to path matching when meta.main is undefined"
  );
});

Deno.test("isMain - JSR / Remote Module (Deno)", () => {
  // Remote modules don't exist on local disk, so path matching would fail.
  // We MUST rely on meta.main here.
  const mockMeta = { 
    main: true, 
    url: "jsr:@webpod/zx/cli.ts" 
  } as any;

  assertEquals(
    isMain(mockMeta), 
    true, 
    "Should return true for JSR entry points via native property"
  );
});
