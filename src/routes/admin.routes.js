const router = require("express").Router();
const auth = require("../middleware/auth");
const AdminUserController = require("../controllers/admin/user.controller");

router.post("/create", AdminUserController.createAdmin);
router.get("/users", auth.admin, AdminUserController.getAllUsers);
router.get("/users/:id", auth.admin, AdminUserController.getUser);
router.get("/team", auth.admin, AdminUserController.getAllTeamMembers);
router.put("/update-role", auth.admin, AdminUserController.updateRole);
router.delete("/delete-user", auth.admin, AdminUserController.deleteUser);

module.exports = router;
