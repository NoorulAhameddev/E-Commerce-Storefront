import { loginSchema, registerSchema, productSchema, checkoutSchema, orderStatusSchema } from "../../src/lib/validators";
import { createSessionToken, readSessionToken, hashPassword, verifyPassword, SessionUser } from "../../src/lib/auth";
import { checkRateLimit } from "../../src/lib/rate-limit";

async function runStoreTestSuite() {
  console.log("==========================================");
  console.log("  SHOPWAVE STOREFRONT UNIT & LOGIC SUITE  ");
  console.log("==========================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${name}`);
    }
  }

  // Set dummy JWT_SECRET for test runner
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-12345";

  // 1. Password Hashing & Verification
  console.log("--- 1. Password Security ---");
  const rawPass = "CustomerPass123!";
  const hash = await hashPassword(rawPass);
  assert(await verifyPassword(rawPass, hash), "Correct password verifies successfully");
  assert(!(await verifyPassword("WrongPass!", hash)), "Incorrect password fails verification");

  // 2. Auth Session Tokens
  console.log("\n--- 2. JWT Session Handling ---");
  const user: SessionUser = {
    id: "usr_12345",
    email: "customer@store.com",
    name: "Jane Store Customer",
    role: "USER"
  };

  const token = createSessionToken(user);
  assert(typeof token === "string" && token.length > 20, "Session token created");

  const session = readSessionToken(token);
  assert(session !== null && session.id === user.id && session.role === user.role, "Session token decoded correctly");
  assert(readSessionToken("invalid-token") === null, "Invalid token returns null");
  assert(readSessionToken(null) === null, "Null token returns null");

  // 3. Validation Schemas
  console.log("\n--- 3. Input Validation Schemas ---");
  assert(loginSchema.safeParse({ email: "user@example.com", password: "password123" }).success, "Valid login passes");
  assert(!loginSchema.safeParse({ email: "not-an-email", password: "123" }).success, "Invalid email fails login");

  assert(registerSchema.safeParse({ name: "Alice", email: "alice@example.com", password: "password123" }).success, "Valid registration passes");
  assert(!registerSchema.safeParse({ name: "", email: "alice@example.com", password: "password123" }).success, "Empty name fails registration");

  assert(productSchema.safeParse({ name: "Premium Headphones", description: "High quality noise cancelling headphones", price: 299.99, inventory: 50 }).success, "Valid product passes");
  assert(!productSchema.safeParse({ name: "Product", description: "Short", price: -10, inventory: -5 }).success, "Negative price and inventory fail product schema");

  assert(orderStatusSchema.safeParse({ status: "PAID" }).success, "Valid order status enum passes");
  assert(!orderStatusSchema.safeParse({ status: "INVALID_STATUS" }).success, "Invalid order status enum fails");

  // 4. Rate Limiting Tests
  console.log("\n--- 4. IP Rate Limiting ---");
  const testIp = "10.0.0.1";
  let rlRes;
  for (let i = 1; i <= 10; i++) {
    rlRes = checkRateLimit(`login:${testIp}`, 10, 60000);
  }
  assert(rlRes?.success === true, "Rate limiter permits 10 login requests");
  const rlExceeded = checkRateLimit(`login:${testIp}`, 10, 60000);
  assert(rlExceeded.success === false, "Rate limiter blocks 11th login attempt (429)");

  console.log("\n==========================================");
  console.log(`  SUITE COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log("==========================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runStoreTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
