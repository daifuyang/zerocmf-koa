export const jwtSecret = process.env.JWT_SECRET || "nextcms";
export const jwtSecretExpire = process.env.JWT_SECRET_EXPIRE || "1d";
export const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "nextcms";
export const jwtRefreshSecretExpire = process.env.JWT_REFRESH_SECRET_EXPIRE || "7d";