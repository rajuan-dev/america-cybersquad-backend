import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IFilterRequest } from "./statistics.interface";
import { getDateRange } from "../../../helpars/filterByDate";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

// get overview total clients, total providers,total revenue
const getOverview = async (params: IFilterRequest) => {
  const { timeRange, year } = params;
  const dateRange = getDateRange(timeRange);

  // total users
  const totalUsers = await prisma.user.count({
    // where: {
    //   role: UserRole.USER,
    // },
  });

  // total hotel
  const totalHosts = await prisma.tripService.count({});

  // total hotel bookings
  const totalHotelBookings = await prisma.tripServiceBooking.count({
    where: {
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
    },
  });

  // total service booking
  const totalServiceBookings = await prisma.tripServiceBooking.count({
    where: {
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
    },
  });

  // total booking
  const totalBookings = totalHotelBookings + totalServiceBookings;

  // admin earnings (only PAID payments)
  const adminEarnings = await prisma.payment.aggregate({
    where: {
      status: {
        in: [PaymentStatus.PAID],
      },
    },
    _sum: {
      amount: true,
    },
  });

  // user chart data - monthly user registration with year filter
  const filterYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(filterYear, 0, 1); // january 1st of selected year
  const endOfYear = new Date(filterYear, 11, 31, 23, 59, 59); // december 31st of selected year

  const userChartData = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // group users by month for chart (all 12 months)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const userChart = monthNames.map((month, index) => {
    const monthUsers = userChartData.filter((user) => {
      const userDate = new Date(user.createdAt);
      return (
        userDate.getMonth() === index && userDate.getFullYear() === filterYear
      );
    });

    return {
      month,
      count: monthUsers.length,
    };
  });

  // recent users - last 5 users
  const recentUsers = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return {
    totalUsers,
    totalHosts,
    totalBookings,
    adminEarnings: adminEarnings._sum.amount || 0,
    userChart,
    recentUsers,
    filterYear,
  };
};

// get agent total earnings and bookings
const getAgentTotalEarningsAndBookings = async (
  userId: string,
  timeRange?: string,
) => {
  // find agent
  const agent = await prisma.user.findFirst({
    where: {
      id: userId,
      role: UserRole.AGENT,
    },
  });

  if (!agent) {
    throw new ApiError(httpStatus.NOT_FOUND, "Agent not found");
  }

  const dateRange = getDateRange(timeRange);

  // monthly bookings data
  const monthlyBookingsData = await prisma.tripServiceBooking.findMany({
    where: {
      userId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
      ...(dateRange && { createdAt: dateRange }),
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // monthly earnings data
  const monthlyEarningsData = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PAID,
      userId,
      ...(dateRange && { createdAt: dateRange }),
    },
    select: {
      createdAt: true,
      agent_commission: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // group bookings by month
  const bookingsByMonth = monthlyBookingsData.reduce(
    (acc: Record<string, number>, booking) => {
      const key = booking.createdAt.toISOString().slice(0, 7);

      if (!acc[key]) acc[key] = 0;
      acc[key] += 1;

      return acc;
    },
    {},
  );

  // group earnings by month
  const earningsByMonth = monthlyEarningsData.reduce(
    (acc: Record<string, number>, payment) => {
      const key = payment.createdAt.toISOString().slice(0, 7);

      if (!acc[key]) acc[key] = 0;
      acc[key] += payment.agent_commission || 0;

      return acc;
    },
    {},
  );

  // current & Previous Month calculation
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(
    prevDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const currentBookings = bookingsByMonth[currentMonthKey] || 0;
  const prevBookings = bookingsByMonth[prevMonthKey] || 0;

  const currentEarnings = earningsByMonth[currentMonthKey] || 0;
  const prevEarnings = earningsByMonth[prevMonthKey] || 0;

  // growth calculation
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  };

  const bookingsGrowth = calculateGrowth(currentBookings, prevBookings);
  const earningsGrowth = calculateGrowth(currentEarnings, prevEarnings);

  const monthName = new Date(`${currentMonthKey}-01`).toLocaleString(
    "default",
    { month: "short" },
  );

  // recent bookings
  const recentBookings = await prisma.tripServiceBooking.findMany({
    where: {
      userId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
    },
    select: {
      clientName: true,
      from: true,
      to: true,
      serviceType: true,
      timeSlot: true,
      status: true,
      isReturn: true,
      totalPrice: true,
      createdAt: true,
      updatedAt: true,
      payments: {
        select: {
          agent_commission: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          address: true,
          country: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    totalBookings: {
      month: monthName,
      value: currentBookings,
      growthOrDown: bookingsGrowth,
    },

    totalEarnings: {
      month: monthName,
      value: currentEarnings,
      growthOrDown: earningsGrowth,
    },

    recentBookings,
    timeRange: timeRange || "ALL_TIME",
  };
};

// get agent bookings
const getAgentBookings = async (
  userId: string,
  timeRange?: string,
  status?: string,
) => {
  // find agent
  const agent = await prisma.user.findFirst({
    where: {
      id: userId,
      role: UserRole.AGENT,
    },
  });
  if (!agent) {
    throw new ApiError(httpStatus.NOT_FOUND, "Agent not found");
  }

  // validate booking status
  const validStatuses = Object.values(BookingStatus);
  if (status && !validStatuses.includes(status as BookingStatus)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid booking status. Valid statuses are: ${validStatuses.join(", ")}`,
    );
  }

  // date range filter
  const dateRange = getDateRange(timeRange);

  // total bookings
  const totalBookings = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
      ...(dateRange && { createdAt: dateRange }),
    },
  });

  // total confirmed booking
  const totalConfirmedBookings = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: BookingStatus.CONFIRMED,
      ...(dateRange && { createdAt: dateRange }),
    },
  });
  // total completed booking
  const totalCompletedBookings = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: BookingStatus.COMPLETED,
      ...(dateRange && { createdAt: dateRange }),
    },
  });

  // total earnings
  const totalEarnings = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.PAID,
      userId,
      ...(dateRange && { createdAt: dateRange }),
    },
    _sum: {
      agent_commission: true,
    },
    _count: {
      id: true,
    },
  });

  // recent bookings for agent (last 10)
  const recentBookings = await prisma.tripServiceBooking.findMany({
    where: {
      userId,
      ...(status ? { status: status as BookingStatus } : {}),
    },
    select: {
      clientName: true,
      from: true,
      to: true,
      serviceType: true,
      timeSlot: true,
      status: true,
      isReturn: true,
      totalPrice: true,
      createdAt: true,
      updatedAt: true,
      payments: {
        select: {
          agent_commission: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          address: true,
          country: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return {
    totalBookings,
    totalConfirmedBookings,
    totalCompletedBookings,
    totalEarnings: totalEarnings._sum.agent_commission || 0,
    recentBookings,
    timeRange: timeRange || "ALL_TIME",
  };
};

// get user dashboard tab info
const getUserDashboardTabInfo = async (userId: string, status?: string) => {
  // find user
  const findUser = await prisma.user.findUnique({
    where: {
      id: userId,
      role: UserRole.USER,
    },
  });
  if (!findUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // validate booking status
  const validStatuses = Object.values(BookingStatus);
  if (status && !validStatuses.includes(status as BookingStatus)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid booking status. Valid statuses are: ${validStatuses.join(", ")}`,
    );
  }

  // total bookings
  const totalBookings = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
    },
  });

  // total confirmed bookings
  const totalConfirmedBookings = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: {
        in: [BookingStatus.CONFIRMED],
      },
    },
  });

  // total spent sum
  const totalSpentResult = await prisma.tripServiceBooking.aggregate({
    where: {
      userId,
    },
    _sum: {
      totalPrice: true,
    },
  });
  const totalSpent = totalSpentResult._sum.totalPrice || 0;

  // monthly bookings data
  const monthlyBookingsData = await prisma.tripServiceBooking.findMany({
    where: {
      userId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // monthly spent data
  const monthlySpentData = await prisma.tripServiceBooking.findMany({
    where: {
      userId,
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // group bookings by month
  const bookingsByMonth = monthlyBookingsData.reduce(
    (acc: Record<string, number>, booking) => {
      const key = booking.createdAt.toISOString().slice(0, 7);

      if (!acc[key]) acc[key] = 0;
      acc[key] += 1;

      return acc;
    },
    {},
  );

  // group spent by month
  const spentByMonth = monthlySpentData.reduce(
    (acc: Record<string, number>, booking) => {
      const key = booking.createdAt.toISOString().slice(0, 7);

      if (!acc[key]) acc[key] = 0;
      acc[key] += booking.totalPrice || 0;

      return acc;
    },
    {},
  );

  // current & previous Month calculation
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(
    prevDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const currentBookings = bookingsByMonth[currentMonthKey] || 0;
  const prevBookings = bookingsByMonth[prevMonthKey] || 0;

  const currentSpent = spentByMonth[currentMonthKey] || 0;
  const prevSpent = spentByMonth[prevMonthKey] || 0;

  // growth calculation
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  };

  const bookingsGrowth = calculateGrowth(currentBookings, prevBookings);
  const spentGrowth = calculateGrowth(currentSpent, prevSpent);

  const monthName = new Date(`${currentMonthKey}-01`).toLocaleString(
    "default",
    { month: "short" },
  );

  // recent bookings with filter on status
  const recentBookings = await prisma.tripServiceBooking.findMany({
    where: {
      userId,
      ...(status ? { status: status as BookingStatus } : {}),
    },
    select: {
      clientName: true,
      from: true,
      to: true,
      serviceType: true,
      timeSlot: true,
      status: true,
      isReturn: true,
      totalPrice: true,
      createdAt: true,
      updatedAt: true,
      payments: {
        select: {
          agent_commission: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          address: true,
          country: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    totalBookings: {
      month: monthName,
      value: currentBookings,
      growthOrDown: bookingsGrowth,
    },
    totalConfirmedBookings: totalConfirmedBookings || 0,
    totalSpent: {
      month: monthName,
      value: currentSpent,
      growthOrDown: spentGrowth,
    },
    recentBookings,
  };
};

// service provider total earnings service
const getServiceProviderTotalEarningsService = async (
  providerId: string,
  timeRange?: string,
) => {
  // find partner
  const partner = await prisma.user.findUnique({
    where: {
      id: providerId,
    },
  });
  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  // date range filter
  const dateRange = getDateRange(timeRange);

  // total earnings
  const earnings = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.PAID,
      ...(dateRange && { createdAt: dateRange }),
    },
  });
  console.log(earnings, "earnings");

  // total bookings
  const totalBookings = await prisma.tripServiceBooking.count({
    where: {
      status: BookingStatus.CONFIRMED,
      ...(dateRange && { createdAt: dateRange }),
    },
  });

  // earnings trend - monthly data
  const monthlyPayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PAID,
      userId: providerId,
      ...(dateRange && { createdAt: dateRange }),
    },
  });

  // bookings trend - monthly data
  const monthlyBookings = await prisma.tripServiceBooking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      ...(dateRange && { createdAt: dateRange }),
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // group earnings by month
  const earningsByMonth = monthlyPayments.reduce((acc: any, payment) => {
    const monthKey = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, earnings: 0, count: 0 };
    }
    acc[monthKey].earnings += payment.agent_commission || 0;
    acc[monthKey].count += 1;
    return acc;
  }, {});

  // group bookings by month
  const bookingsByMonth = monthlyBookings.reduce((acc: any, booking) => {
    const monthKey = booking.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, bookings: 0, revenue: 0 };
    }
    acc[monthKey].bookings += 1;
    acc[monthKey].revenue += booking.totalPrice;
    return acc;
  }, {});

  // get current year
  const currentYear = new Date().getFullYear();

  // create proper month mapping
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // generate all months from January to December for current year
  const allMonths = [];
  for (let i = 0; i < 12; i++) {
    const monthKey = `${currentYear}-${String(i + 1).padStart(2, "0")}`; // YYYY-MM format
    const monthName = monthNames[i];

    allMonths.push({
      month: monthKey,
      monthName: monthName,
      earnings: earningsByMonth[monthKey]?.earnings || 0,
      count: earningsByMonth[monthKey]?.count || 0,
      bookings: bookingsByMonth[monthKey]?.bookings || 0,
      revenue: bookingsByMonth[monthKey]?.revenue || 0,
    });
  }

  // check if we have data for previous December and add it if needed
  const prevDecemberKey = `${currentYear - 1}-12`;

  if (earningsByMonth[prevDecemberKey] || bookingsByMonth[prevDecemberKey]) {
    // replace December (index 11) with previous December data
    allMonths[11] = {
      month: prevDecemberKey,
      monthName: "December",
      earnings: earningsByMonth[prevDecemberKey]?.earnings || 0,
      count: earningsByMonth[prevDecemberKey]?.count || 0,
      bookings: bookingsByMonth[prevDecemberKey]?.bookings || 0,
      revenue: bookingsByMonth[prevDecemberKey]?.revenue || 0,
    };
  }

  // separate earnings and bookings trends
  const earningsTrend = allMonths.map(
    ({ month, monthName, earnings, count }) => ({
      month,
      monthName,
      earnings,
      count,
    }),
  );

  const bookingsTrend = allMonths.map(
    ({ month, monthName, bookings, revenue }) => ({
      month,
      monthName,
      bookings,
      revenue,
    }),
  );

  return {
    // totalEarnings: earnings._sum.amount || 0,
    // totalPayments: earnings._count.id || 0,
    totalBookings,
    earningsTrend,
    bookingsTrend,
    timeRange: timeRange || "ALL_TIME",
  };
};

// admin earns
const getAdminTotalEarnings = async (timeRange?: string) => {
  const dateRange = getDateRange(timeRange);

  // all payments with date filtering
  const payments = await prisma.payment.findMany({
    where: {
      status: {
        in: [PaymentStatus.PAID],
      },
      ...(dateRange && { createdAt: dateRange }),
    },
    select: {
      amount: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // all hotel bookings bookingStatus COMPLETED with date filtering
  const hotelBookings = await prisma.tripServiceBooking.count({
    where: {
      status: BookingStatus.COMPLETED,
      ...(dateRange && { createdAt: dateRange }),
    },
  });

  // all service bookings bookingStatus COMPLETED with date filtering
  const serviceBookings = await prisma.tripServiceBooking.count({
    where: {
      status: BookingStatus.COMPLETED,
      ...(dateRange && { createdAt: dateRange }),
    },
  });

  // total COMPLETED bookings
  const totalBookings = hotelBookings + serviceBookings;

  // average per booking amount from PAID payments only
  const paidPayments = payments.filter(
    (payment) => payment.status === PaymentStatus.PAID,
  );
  const averageEarnings =
    totalBookings > 0 && paidPayments.length > 0
      ? paidPayments.reduce((sum, payment) => sum + payment.amount, 0) /
        paidPayments.length
      : 0;

  // get all hotel bookings
  const allHotelBookings = await prisma.tripServiceBooking.findMany({
    where: {
      status: {
        in: [
          BookingStatus.CONFIRMED,
          BookingStatus.CANCELLED,
          BookingStatus.COMPLETED,
        ],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
  // get all service bookings
  const allServiceBookings = await prisma.tripServiceBooking.findMany({
    where: {
      status: {
        in: [
          BookingStatus.CONFIRMED,
          BookingStatus.CANCELLED,
          BookingStatus.COMPLETED,
        ],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  // combine all bookings
  const recentBookings = [
    ...allHotelBookings.map((booking) => ({
      ...booking,
      type: "HOTEL",
    })),
    ...allServiceBookings.map((booking) => ({
      ...booking,
      type: "SERVICE",
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // group by month
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();

  // all months with zero
  const monthlyEarnings = monthNames.map((month, index) => {
    const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`;

    const monthPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return (
        paymentDate.getMonth() === index &&
        paymentDate.getFullYear() === currentYear
      );
    });

    const totalEarnings = monthPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return {
      month,
      monthKey,
      earnings: totalEarnings,
      count: monthPayments.length,
    };
  });

  // calculate total earnings
  const totalEarnings = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  return {
    totalEarnings,
    totalBookings,
    averageEarnings,
    monthlyEarnings,
    recentBookings,
    timeRange: timeRange || "ALL_TIME",
  };
};

// get my properties, services bookings, guest bookings, earnings
const getMyDashboardForPropertyOwner = async (userId: string) => {
  // total properties
  const totalProperties = await prisma.tripService.count({});

  // total services bookings
  const totalServices = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: BookingStatus.CONFIRMED,
    },
  });

  // total hotel bookings (guest bookings)
  const totalBookings = await prisma.tripServiceBooking.count({
    where: {
      userId,
      status: BookingStatus.CONFIRMED,
    },
  });

  // total payments sum
  const totalPaymentsAgg = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.PAID,
    },
    _sum: {
      amount: true,
    },
  });

  let totalPayments = 0;
  if (
    totalPaymentsAgg &&
    totalPaymentsAgg._sum &&
    totalPaymentsAgg._sum.amount
  ) {
    totalPayments = totalPaymentsAgg._sum.amount;
  }

  return {
    totalProperties,
    totalServices,
    totalBookings,
    totalPayments,
  };
};

// get my services, services bookings,  earnings
const getMyDashboardForServiceProvider = async (userId: string) => {
  // total services
  const totalServices = await prisma.tripService.count({});

  // total services bookings
  const totalServicesBookings = await prisma.tripServiceBooking.count({});

  // total payments
  const totalPayments = await prisma.payment.count({
    where: {
      userId,
      status: PaymentStatus.PAID,
    },
  });

  return {
    totalServices,
    totalServicesBookings,
    totalPayments,
  };
};

export const StatisticsService = {
  getOverview,

  // sales
  getAgentTotalEarningsAndBookings,
  getAgentBookings,
  getUserDashboardTabInfo,
  getServiceProviderTotalEarningsService,
  getMyDashboardForPropertyOwner,
  getMyDashboardForServiceProvider,

  // admin earns
  getAdminTotalEarnings,
};
