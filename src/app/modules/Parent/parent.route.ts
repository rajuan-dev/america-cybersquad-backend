import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import ParentController from './parent.controller';


const router=express.Router();
router.get("/find_my_children_all_result", auth(UserRole.parent),ParentController.findMyChildrenAllResult );


const ParentRouter=router;
export default ParentRouter;




