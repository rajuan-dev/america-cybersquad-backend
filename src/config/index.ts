import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  frontend_url: process.env.FRONTEND_URL,
  backend_base_url: process.env.BACKEND_IMAGE_URL,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  NODE_ENV: process.env.NODE_ENV,
  // Payment configurations
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    clientId: process.env.STRIPE_CLIENT_ID,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    refreshUrl: process.env.ONBOARDING_REFRESH_URL,
    returnUrl: process.env.ONBOARDING_RETURN_URL,
    checkout_success_url: process.env.CHECKOUT_SUCCESS_URL,
    checkout_cancel_url: process.env.CHECKOUT_CANCEL_URL,
  },

  payStack: {
    publicKey: process.env.PAYSTACK_PUBLISHABLE_KEY,
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    apiUrl:
      process.env.NODE_ENV === "production"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com",
  },
  
  


  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  expires_in: process.env.EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_expires_in: process.env.REFRESH_EXPIRES_IN,

  reset_pass_link: process.env.RESET_PASS_LINK,

  send_email: {
    nodemailer_email: process.env.NODEMAILER_EMAIL,
    nodemailer_password: process.env.NODEMAILER_PASSWORD,
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  s3: {
    do_space_endpoint: process.env.DO_SPACE_ENDPOINT,
    do_space_accesskey: process.env.DO_SPACE_ACCESS_KEY,
    do_space_secret_key: process.env.DO_SPACE_SECRET_KEY,
    do_space_bucket: process.env.DO_SPACE_BUCKET,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    twilioNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  flutterwave: {
    publicKey: process.env.FLUTTERWAVE_PUBLISHABLE_KEY,
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
    webhookKey: process.env.FLUTTERWAVE_WEBHOOK_SECRET,

    currency: process.env.CURRENCY || "USD",
    ownerPayoutPercent: Number(process.env.OWNER_PAYOUT_PERCENT || 80),
    ownerCommissionPercent: Number(process.env.OWNER_COMMISSION_PERCENT || 20),
  },

  s3_bucket: {
    aws_bucket_accesskey: process.env.AWS_BUCKET_ACCESS_KEY,
    aws_bucket_secret_key: process.env.AWS_BUCKET_SECRET_KEY,
    aws_bucket_region: process.env.AWS_BUCKET_REGION,
    aws_bucket_name: process.env.AWS_BUCKET_NAME,
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD,
  },
};
