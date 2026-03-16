import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import ContactServices from "./conatact.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";




const  createContact:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ContactServices.createContactIntoDb(req.body);

        sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Recorded",
    data: result,
  });

});


const findByAllContactAdmin:RequestHandler=catchAsync(async(req , res)=>{

     const result=await ContactServices.findByAllContactAdminIntoDb(req.query);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Contact",
    data: result,
  });
      
});



const deleteContact:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ContactServices.deleteContactIntoDb( req.params.id);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete",
    data: result,
  });

})


const ContactController={
    createContact,
    findByAllContactAdmin,
     deleteContact
};

export default ContactController;


