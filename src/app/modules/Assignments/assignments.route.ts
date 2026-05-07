import express, { NextFunction, Request, Response } from 'express';
import branchAdminAuth from '../../middlewares/branchAdminAuth';
import { UserRole } from '@prisma/client';
import { uploadFile } from '../../../helpars/fileUploader';
import ApiError from '../../../errors/ApiErrors';
import validateRequest from '../../middlewares/validateRequest';
import httpStatus from 'http-status';
import AssignmentValidation from './assignments.validation';
import AssignmentsController from './assignments.controller';
import auth from '../../middlewares/auth';

const router=express.Router();

router.post(
  "/create_assignment",
  branchAdminAuth(UserRole.TEACHER),

  uploadFile.attachmentFiles,

  (req: Request, _res: Response, next: NextFunction) => {
    try {
    
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      
      if (req.files && (req.files as any).attachments) {
        const files = (req.files as any).attachments;

        req.body.attachmentFiles = files.map((file: Express.Multer.File) =>
          uploadFile.toRelativePath(file.path)
        );
      }

      next();
    } catch (error: any) {
      next(new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data"));
    }
  },

  validateRequest(AssignmentValidation.assignmentSchema),
  AssignmentsController.createAssignments
);

router.get("/find_by_specific_teacher_assignment/:classDistributionId", auth(UserRole.TEACHER), AssignmentsController.findBySpecificTeacherAssignment);


const AssignmentRouter=router;
export default AssignmentRouter;

