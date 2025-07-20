import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Icon } from "@iconify/react";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import styles from "./index.module.scss";
import { HTTPService } from "../../services/http-service/http-service";
import { tokenService } from "../../services/token-service/token-service";
import { useNavigate } from "react-router";
import { RouteConstant } from "../../constant/route-constant";
import { showToast } from "../../services/toaster-service";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const { email, password } = tokenService.retriveUserEmailPassword();
    if (email && password) {
      reset({
        email,
        password,
        rememberMe: true,
      });
    }
  }, [reset]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      if (data.rememberMe) {
        tokenService.setUserEmailPassword(data.email, data.password);
      }

      const response = await HTTPService.postRequest("/admin/login", data);

      if (response && response?.success) {
        tokenService.setToken(response?.data?.token);
        tokenService.storeUserInfo(response?.data?.admin);
        showToast("success", "Success", "Logged in successfully.");
        navigate(RouteConstant.Admin.Blogs);
      }
    } catch (error) {
      showToast(
        "error",
        "Login Failed",
        "Invalid credentials or server error."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFormErrorMessage = (name: keyof LoginFormData) => {
    return errors[name] ? (
      <div className="text-danger small mt-1">{errors[name]?.message}</div>
    ) : null;
  };

  return (
    <div className="container-fluid p-0 login-form-container">
      <div className={styles["login-container"]}>
        <div className="row g-0 h-100">
          {/* Left Form Section */}
          <div className="col-lg-6">
            <div className={styles["form-section"]}>
              <div className={styles["brand-logo"]}>
                <Icon
                  icon="mdi:shield-crown"
                  className="text-white"
                  style={{ fontSize: "24px" }}
                />
              </div>

              <h1 className={styles["form-title"]}>Welcome back!</h1>
              <p className={styles["form-subtitle"]}>
                Enter to get unlimited access to data & information.
              </p>

              <div className="form-group">
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="form-item">
                      <label className="form-label">Email *</label>
                      <InputText
                        {...field}
                        type="email"
                        placeholder="Enter your mail address"
                        className={fieldState.error ? "p-invalid" : ""}
                      />
                      {getFormErrorMessage("email")}
                    </div>
                  )}
                />
              </div>

              <div className="form-group">
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="form-item">
                      <label className="form-label">Password *</label>
                      <Password
                        {...field}
                        placeholder="Enter password"
                        toggleMask
                        className={fieldState.error ? "p-invalid " : ""}
                        feedback={false}
                        inputClassName="w-100"
                      />
                      {getFormErrorMessage("password")}
                    </div>
                  )}
                />
              </div>

              <div className="remember-section d-flex justify-content-between align-items-center mt- mb-3">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <div className="d-flex align-items-center">
                      <Checkbox
                        inputId="rememberMe"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.checked)}
                        className="me-2"
                        pt={{
                          input: {
                            className: styles["checkbox-class"],
                          },
                          box: {
                            className: styles["checkbox-class"],
                          },
                          root: {
                            className: styles["checkbox-class"],
                          },
                        }}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="mb-0"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Remember me
                      </label>
                    </div>
                  )}
                />
                <a
                  href="#"
                  className={styles["forgot-link"]}
                  onClick={() => navigate(RouteConstant.Auth.ResetPassword)}
                >
                  Forgot your password?
                </a>
              </div>

              <Button
                label={isLoading ? "Loging In..." : "Log In"}
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
                className="login-button w-100 rounded-2 justify-content-center align-items-center"
                rounded
                disabled={isLoading}
              />

              <div className={styles["register-section"]}>
                <p className="text-muted mb-0">
                  Don't have an account?{" "}
                  <a href="#" className={styles["register-link"]}>
                    Register here
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Illustration Section */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className={styles["illustration-section"] + " " + "h-100"}>
              <div className={styles["geometric-bg"]}></div>
              <div className={styles["geometric-shapes"]}>
                <div
                  className={styles["shape"] + " " + styles["shape-1"]}
                ></div>
                <div
                  className={styles["shape"] + " " + styles["shape-2"]}
                ></div>
                <div
                  className={styles["shape"] + " " + styles["shape-3"]}
                ></div>
                <div
                  className={styles["shape"] + " " + styles["shape-4"]}
                ></div>
              </div>

              <div className={styles["admin-illustration"]}>
                <Icon
                  icon="mdi:view-dashboard"
                  className={styles["admin-icon"]}
                />
                <div className={styles["admin-text"]}>Admin Dashboard</div>
                <div className={styles["admin-subtext"]}>
                  Manage your business with ease
                </div>

                <div className="mt-4 d-flex justify-content-center gap-3">
                  <Icon
                    icon="mdi:chart-line"
                    style={{
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  />
                  <Icon
                    icon="mdi:account-group"
                    style={{
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  />
                  <Icon
                    icon="mdi:cog"
                    style={{
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
