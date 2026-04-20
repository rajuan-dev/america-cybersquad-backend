import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';

import subscriptionController from './subscription.controller';
import subscriptionValidation from './subscription.validation';



const route=express.Router();


route.post("/buy_the_subscription", auth(UserRole.INSTITUTIONAL_OWNER), validateRequest(subscriptionValidation.subscriptionsSchema), subscriptionController.saveUserSubscription);
route.get("/find_by_all_subscription", auth(UserRole.ADMIN, UserRole.INSTITUTIONAL_OWNER),subscriptionController.findByAllSubscriptionsAdmin );
route.delete("/delete_subscription/:subscriptionId", auth(UserRole.ADMIN, UserRole.INSTITUTIONAL_OWNER), subscriptionController.hardDeleteSubscriptionById );
route.get("/find_my_all_subscription", auth(UserRole.INSTITUTIONAL_OWNER), subscriptionController.findMyAllSubscriptions )

const subscriptionRoute=route;

export default subscriptionRoute