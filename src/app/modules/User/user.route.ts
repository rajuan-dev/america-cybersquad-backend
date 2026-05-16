import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import userValidation from "./user.validation";
import UserController from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";



const router = express.Router();


router.post("/create_user", validateRequest(userValidation.createUserZodSchema), UserController.createUser);
router.patch(
  "/user_verification",
  validateRequest(userValidation.verificationCodeZodSchema),
  UserController.userVerification
);

router.patch(
  "/change_password",auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.SUPER_ADMIN, UserRole.parent,UserRole.TEACHER,UserRole.INSTITUTIONAL_OWNER),
  validateRequest(userValidation.changePasswordSchema),
  UserController.changePassword
);

router.post(
  "/forgot_password",
  validateRequest(userValidation.forgotPasswordSchema),
  UserController.forgotPassword
);

router.post(
  "/verification_forgot_user",
  validateRequest(userValidation.verificationCodeSchema),
  UserController.verificationForgotUser
);

router.post(
  "/reset_password",
  validateRequest(userValidation.resetPasswordSchema),
  UserController.resetPassword
);

router.get("/find_by_user_growth", auth(UserRole.ADMIN,  UserRole.SUPER_ADMIN ), UserController.getUserGrowth);

router.get("/resend_verification_otp/:email",UserController.resendVerificationOtp);

export const userRoute = router;

    
