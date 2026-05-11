import prisma from "../../shared/prisma";

const autoCheckedAssessmentAvailable = async () => {
  try {
    const currentDate = new Date();
    const result = await prisma.classAssignment.updateMany({
      where: {
        assessmentAvailable: false,

        assignmentDueDate: {
          lte: currentDate,
        },
      },

      data: {
        assessmentAvailable: true,
      },
    });

    console.log(
      `[Cron] ${result.count} assignments updated successfully`
    );
  } catch (error) {
    console.error(
      "[Cron] Error autoCheckedAssessmentAvailable:",
      error
    );
  }
};

export default autoCheckedAssessmentAvailable;