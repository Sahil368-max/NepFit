const router = require('express').Router();
const multer = require('multer');
const upload = multer();


const authGuard = require('../utlis/authGuard'); 

const { registerUser, userLogin, updateProfile, updatePassword, getTrainerClients, getClientHistory } = require("../controllers/userController");
const { verifyEmail } = require('../utlis/verifyEmail');
const bmiController = require("../controllers/bmiController");
const mealController = require("../controllers/mealController");
const workoutController = require("../controllers/exeController");

const badgeController = require("../controllers/badgeController");


router.post("/register", upload.none(), registerUser);
router.post("/login", userLogin);
router.get("/verify-email", verifyEmail);




// ----- Profile & Trainer Routes -----
router.put("/profile", authGuard, updateProfile);
router.put("/password", authGuard, updatePassword);
router.get("/trainer/clients", authGuard, getTrainerClients);
router.get("/trainer/client/:clientId/history", authGuard, getClientHistory); 

// ----- Badge Routes (Gamification!) -----

router.post("/trainer/award-badge", authGuard, badgeController.awardBadge);
router.get("/my-badges", authGuard, badgeController.getMyBadges);

// ----- Meal Routes -----
router.post("/meals", authGuard, mealController.addMeal);
router.get("/meals", authGuard, mealController.getMeals);
router.put("/meals/:id", authGuard, mealController.updateMeal);
router.delete("/meals/:id", authGuard, mealController.deleteMeal);

// ----- BMI Routes -----
router.post("/bmi", authGuard, bmiController.addBMI);
router.get("/bmi", authGuard, bmiController.getBMI);
router.put("/bmi/:id", authGuard, bmiController.updateBMI);
router.delete("/bmi/:id", authGuard, bmiController.deleteBMI);

router.post("/workouts/save", authGuard, workoutController.saveWorkout);
router.get("/workouts/:userId", authGuard, workoutController.getWorkouts);

module.exports = router;