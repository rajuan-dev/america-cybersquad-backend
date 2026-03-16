import express from "express";

import { authRoutes } from "../modules/Auth/auth.routes";
import { userRoute } from "../modules/User/user.route";
import ContactRoute from "../modules/contact/contact.route";


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
  }

  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
