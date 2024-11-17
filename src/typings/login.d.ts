export interface LoginReq {
  account: string;
  password: string;
  loginType: "account" | "email" | "phone";
  phoneType: "password" | "sms";
}
