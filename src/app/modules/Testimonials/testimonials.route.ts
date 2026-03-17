import express, { NextFunction, Response, Request } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { uploadFile } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import TestimonialController from "./testimonials.controller";
 
const route = express.Router();
 
route.post(
  "/create_testimonials",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.advertiseVideo, // single("advertiseVideo") — accepts one video field
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  TestimonialController.createTestimonials,
);


route.get("/find_by_all_testimonials", TestimonialController.findByAllTestimonials);
route.delete("/delete_testimonials/:id",auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), TestimonialController.deleteTestimonials );



 
const TestimonialsRoute = route;
 
export default TestimonialsRoute;
 