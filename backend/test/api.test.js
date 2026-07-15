const request = require("supertest");
require("dotenv").config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

describe("STRIDE.FIT Master API Tests", () => {
  let userToken = "";
  let savedMealId = ""; // 🌟 NEW: To store the Meal ID for update/delete tests
  let savedBmiId = "";  // 🌟 NEW: To store the BMI ID for update/delete tests
  
  const masterEmail = `master_${Date.now()}@gmail.com`;
  const masterPassword = "securepassword123";

  

  // 1️⃣ Successful registration
  it("should register a new user successfully", async () => {
    const uniqueName = `testuser_${Date.now()}`;

    const res = await request(BASE_URL)
      .post("/api/user/register")
      .send({
        username: uniqueName,
        email: masterEmail,
        password: masterPassword
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // 2️⃣ Missing fields in registration
  it("should return 400 if required fields are missing during registration", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/register")
      .send({ email: "missingfields@gmail.com" });

    expect(res.status).toBe(400);
  });

  // 3️⃣ Duplicate email registration
  it("should return 400 if email already exists", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/register")
      .send({
        username: `another_${Date.now()}`,
        email: masterEmail, 
        password: "newpassword123"
      });

    expect(res.status).toBe(400);
  });

  // ==========================================
  // 🔐 LOGIN TESTS (3 Tests)
  // ==========================================

  // 4️⃣ Successful login
  it("should login successfully and return a token", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/login")
      .send({
        email: masterEmail,
        password: masterPassword
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    userToken = res.body.token; 
  });

  // 5️⃣ Wrong password
  it("should return 401 if login password is incorrect", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/login")
      .send({
        email: masterEmail,
        password: "wrongpassword!"
      });

    expect(res.status).toBe(401); 
  });

  // 6️⃣ Missing login fields
  it("should return 400 if login fields are missing", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/login")
      .send({ email: masterEmail }); 

    expect(res.status).toBe(400);
  });

  // ==========================================
  // 🏋️ PROTECTED ROUTES - CREATE & READ
  // ==========================================

  // 7️⃣ Unauthorized access
  it("should return 401 when accessing protected routes without a token", async () => {
    const res = await request(BASE_URL).get("/api/user/meals");
    expect(res.status).toBe(401); 
  });

  // 8️⃣ Successfully add a Meal
  it("should add a new meal when authenticated", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/meals")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        type: "Grilled Chicken Salad",
        protein: 45,
        carbs: 10,
        fats: 15
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    
    savedMealId = res.body.data.id; // 🌟 Saving ID for later!
  });

  // 9️⃣ Successfully fetch Meals
  it("should fetch the user's logged meals", async () => {
    const res = await request(BASE_URL)
      .get("/api/user/meals")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 🔟 Successfully add a BMI record
  it("should add a new BMI record when authenticated", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/bmi")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        height: 180,
        weight: 75
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    
    savedBmiId = res.body.data.id; 
  });

  // ==========================================
  // 🔥 PROTECTED ROUTES - UPDATE & DELETE (The 5 New Tests!)
  // ==========================================

  // 1️⃣1️⃣ Fetch BMI Records
  it("should fetch the user's BMI history", async () => {
    const res = await request(BASE_URL)
      .get("/api/user/bmi")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 1️⃣2️⃣ Update Meal
  it("should successfully update an existing meal", async () => {
    const res = await request(BASE_URL)
      .put(`/api/user/meals/${savedMealId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ protein: 55 }); // Updating just the protein

    expect(res.status).toBe(200);
    expect(res.body.data.protein).toBe(55); // Checking if it actually updated
  });

  // 1️⃣3️⃣ Update BMI
  it("should successfully update an existing BMI record", async () => {
    const res = await request(BASE_URL)
      .put(`/api/user/bmi/${savedBmiId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ weight: 73 }); // User lost 2kg!

    expect(res.status).toBe(200);
    expect(res.body.data.weight).toBe(73);
  });

  // 1️⃣4️⃣ Delete Meal
  it("should delete a meal successfully", async () => {
    const res = await request(BASE_URL)
      .delete(`/api/user/meals/${savedMealId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("deleted");
  });

  // 1️⃣5️⃣ Delete BMI
  it("should delete a BMI record successfully", async () => {
    const res = await request(BASE_URL)
      .delete(`/api/user/bmi/${savedBmiId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("deleted");
  });

});