class Configuration {
    public projectName: string;
    public debug: string;
    public emailOTPExpireSeconds: number;
    public accessTokenExpireMinutes: number;
    public refreshTokenExpireMinutes: number;
    public secretKey: string;
    public frontendUrl: string;
    public firstSuperuserEmail: string;
    public firstSuperuserPassword: string;
    public firstAuctioneerEmail: string;
    public firstAuctioneerPassword: string;
    public firstReviewerEmail: string;
    public firstReviewerPassword: string;
    public postgresUser: string;
    public postgresPassword: string;
    public postgresServer: string;
    public postgresPort: number;
    public postgresDb: string;
    public mailSenderEmail: string;
    public mailSenderPassword: string;
    public mailSenderHost: string;
    public mailSenderPort: number;
    public mailFromName: string;
    public corsAllowedOrigins: string;
    public cloudinaryCloudName: string;
    public cloudinaryApiKey: string;
    public cloudinaryApiSecret: string;
  
    constructor() {
      this.projectName = process.env.PROJECT_NAME || '';
      this.debug = process.env.DEBUG || '';
      this.emailOTPExpireSeconds = parseInt(process.env.EMAIL_OTP_EXPIRE_SECONDS || '0');
      this.accessTokenExpireMinutes = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '0');
      this.refreshTokenExpireMinutes = parseInt(process.env.REFRESH_TOKEN_EXPIRE_MINUTES || '0');
      this.secretKey = process.env.SECRET_KEY || '';
      this.frontendUrl = process.env.FRONTEND_URL || '';
      this.firstSuperuserEmail = process.env.FIRST_SUPERUSER_EMAIL || '';
      this.firstSuperuserPassword = process.env.FIRST_SUPERUSER_PASSWORD || '';
      this.firstAuctioneerEmail = process.env.FIRST_AUCTIONEER_EMAIL || '';
      this.firstAuctioneerPassword = process.env.FIRST_AUCTIONEER_PASSWORD || '';
      this.firstReviewerEmail = process.env.FIRST_REVIEWER_EMAIL || '';
      this.firstReviewerPassword = process.env.FIRST_REVIEWER_PASSWORD || '';
      this.postgresUser = process.env.POSTGRES_USER || '';
      this.postgresPassword = process.env.POSTGRES_PASSWORD || '';
      this.postgresServer = process.env.POSTGRES_SERVER || '';
      this.postgresPort = parseInt(process.env.POSTGRES_PORT || '0');
      this.postgresDb = process.env.POSTGRES_DB || '';
      this.mailSenderEmail = process.env.MAIL_SENDER_EMAIL || '';
      this.mailSenderPassword = process.env.MAIL_SENDER_PASSWORD || '';
      this.mailSenderHost = process.env.MAIL_SENDER_HOST || '';
      this.mailSenderPort = parseInt(process.env.MAIL_SENDER_PORT || '0');
      this.mailFromName = process.env.MAIL_FROM_NAME || '';
      this.corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS || '';
      this.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
      this.cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || '';
      this.cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || '';
    }
}
  
const settings = new Configuration();
export default settings;
  