import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import ContactValidation from './contatct.validation';
import ContactController from './conatact.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';



const route=express.Router();


route.post("/create_contact", validateRequest(ContactValidation.contactValidationSchema), ContactController.createContact);
route.get("/find_by_all_contact", auth(UserRole.ADMIN,  UserRole.SUPER_ADMIN ), ContactController.findByAllContactAdmin);
route.delete("/delete_contact/:id", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ContactController.deleteContact);




const ContactRoute=route;

export default ContactRoute;

