import express from "express";

import { authRoutes } from "../modules/Auth/auth.routes";
import { userRoute } from "../modules/User/user.route";
import ContactRoute from "../modules/contact/contact.route";
import TestimonialsRoute from "../modules/Testimonials/testimonials.route";
import subscriptionRoute from "../modules/subscription/subscription.routes";
import branchManagement from "../modules/Branch_Management/branch_management.route";
import studentRoute from "../modules/Students/Students.routes";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path:"/contact",
    route:  ContactRoute
  },
  {
    path:"/testimonials",
    route: TestimonialsRoute
  },
  {
    path:"/subscription",
    route :subscriptionRoute
  },
  {
    path:"/branch_management",
    route: branchManagement
  },

  {
    path:"/students",
    route: studentRoute
  }

  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
