import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TExamAnnouncement } from "./examAnnouncement.interface";
import { getSocketIO } from "../../../socket/connectSocket";

const examAnnouncementServiceIntoDb = async (payload: TExamAnnouncement):Promise<{success:boolean, message:string}> => {
  try {
    const { examDate, tipTapEditor, classDistributionId, subscriptionId } =
      payload;

    const {  students } = await prisma.$transaction(async (tx) => {
     
      const classDistribution = await tx.classDistribution.findUnique({
        where: { id: classDistributionId },
        select: {
          id: true,
          assignableSubject: true,
          students: { select: { id: true } },
        },
      });

      if (!classDistribution) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Class distribution does not exist"
        );
      }

      
      const announcement = await tx.examAnnouncement.create({
        data: {
          examDate,
          tipTapEditor,
          classDistributionId,
          subscriptionId,
        },
      });

      
      if (classDistribution.students.length) {
        await tx.notification.createMany({
          data: classDistribution.students.map((student) => ({
            title: `📚 Exam: ${classDistribution.assignableSubject}`,
            message: "New exam announcement published",
            studentId: student.id,
            subscriptionId,
          })),
        });
      }

      return {
        announcement,
        students: classDistribution.students,
      };
    });

    
    const io = getSocketIO() 

    students.forEach((student) => {
      io.to(`user::${student.id}`).emit("notification", {
        title: "📚 Exam Announcement",
        message: "New exam has been published",
        timestamp: new Date().toISOString(),
      });
    });

    return {
      success: true,
      message: "Successfully sent this announcement"
      
    };
  } catch (error) {
    return catchError(error);
  }
};

const ExamAnnouncementServices={
    examAnnouncementServiceIntoDb
}

export default ExamAnnouncementServices;