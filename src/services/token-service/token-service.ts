import Cookies from "universal-cookie";

class TokenService {
  private cookies = new Cookies();
  private expires = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  })();

  private options = {
    path: "/",
    expires: this.expires,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  setToken(accessToken: string) {
    this.clearAllToken();
    this.cookies.set("accessToken", accessToken, this.options);
  }

  getAccessToken(): string | undefined {
    return this.cookies.get("accessToken");
  }

  storeUserInfo(userinfo: any) {
    this.cookies.set("userinfo", userinfo, this.options);
  }

  retrieveUserInfo() {
    return this.cookies.get("userinfo");
  }

  setUserEmailPassword(email: string, password: string) {
    this.cookies.set("email", email);
    this.cookies.set("password", password);
  }

  retriveUserEmailPassword(){
    const email = this.cookies.get("email");
    const password = this.cookies.get("password");
    return { email, password }
  }

  clearAllToken() {
    this.cookies.remove("accessToken", { path: "/" });
    this.cookies.remove("refreshToken", { path: "/" });
    this.cookies.remove("userinfo", { path: "/" });
    this.clearOriginDomain();
  }

  clearAccessToken() {
    this.cookies.remove("accessToken", { path: "/" });
  }

  setDomain(domain: string) {
    this.cookies.set("x-domain", domain, this.options);
  }

  getDomain(): string | undefined {
    return this.cookies.get("x-domain");
  }

  setOrigin(origin: string) {
    this.cookies.set("x-origin", origin, this.options);
  }

  getOrigin(): string | undefined {
    return this.cookies.get("x-origin");
  }

  clearOriginDomain() {
    this.cookies.remove("x-domain", { path: "/" });
    this.cookies.remove("x-origin", { path: "/" });
  }

  // ❌ Removed: storeUserEmailPass / retrieveUserEmailPass due to security risk
}

// ✅ Export a singleton instance
export const tokenService = new TokenService();
