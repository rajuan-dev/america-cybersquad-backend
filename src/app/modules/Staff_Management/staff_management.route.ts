import express, { NextFunction, Request, Response } from 'express';
import branchAdminAuth from '../../middlewares/branchAdminAuth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import StaffManagementValidation from './staff_management.validation';
import StaffManagementController from './staff_management.controller';
import { uploadFile } from '../../../helpars/fileUploader';
import ApiError from '../../../errors/ApiErrors';
import httpStatus from 'http-status';


const router=express.Router();

router.post("/create_new_staff", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(StaffManagementValidation.staffManagementSchema),StaffManagementController.createStaffManagement );
router.post("/login_staff_management", validateRequest(StaffManagementValidation.loginStaffManagementSchema),StaffManagementController.loginStaffManagement );
router.get("/find_by_all_staff_management", branchAdminAuth(UserRole.BRANCH_ADMIN), StaffManagementController.findByAllStaffManagement);
router.get("/find_by_specific_staff/:staffId", branchAdminAuth(UserRole.BRANCH_ADMIN), StaffManagementController.findBySpecificStaff);
router.patch(
  "/update_profile/:staffId",
  branchAdminAuth(UserRole.BRANCH_ADMIN),

  uploadFile.profileImage, // upload.single("photo")

  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      if (req.file) {

        req.body.profileImage = uploadFile.toRelativePath (req.file.path);
      }

      next();
    } catch (error: any) {
      next(new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data"));
    }
  },

  validateRequest(StaffManagementValidation.updateStaffManagementSchema),
  StaffManagementController.updateStaffInformation
);
const StaffManagementRouter=router;

export default StaffManagementRouter;
