import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Icon } from "@iconify/react";
import styles from "./index.module.scss";
import { HTTPService } from "../../services/http-service/http-service";
import { useNavigate, useParams } from "react-router";
import { RouteConstant } from "../../constant/route-constant";
import { showToast } from "../../services/toaster-service";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setResetError(null);
    try {
      const response = await HTTPService.postRequest("/admin/reset-password", {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response && response?.success) {
        showToast("success", "Success", "Password reset successfully.");
        navigate(RouteConstant.Auth.Login);
      }
    } catch (error) {
      setResetError(
        "An error occurred while resetting password. Please try again."
      );
      showToast(
        "error",
        "Reset Failed",
        "Failed to reset password. Please check your token and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFormErrorMessage = (name: keyof ResetPasswordFormData) => {
    return errors[name] ? (
      <div className="text-danger small mt-1">{errors[name]?.message}</div>
    ) : null;
  };

  return (
    <div className="container-fluid p-0 login-form-container">
      <div className={styles["login-container"]}>
        <div className="row g-0 h-100">
          {/* left Illustration Section */}
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
                <Icon icon="mdi:shield-lock" className={styles["admin-icon"]} />
                <div className={styles["admin-text"]}>Secure Reset</div>
                <div className={styles["admin-subtext"]}>
                  Your account security is our priority
                </div>

                <div className="mt-4 d-flex justify-content-center gap-3">
                  <Icon
                    icon="mdi:lock"
                    style={{
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  />
                  <Icon
                    icon="mdi:key"
                    style={{
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  />
                  <Icon
                    icon="mdi:shield-check"
                    style={{
                      fontSize: "2rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className={styles["form-section"]}>
              <div className={styles["brand-logo"]}>
                <Icon
                  icon="mdi:lock-reset"
                  className="text-white"
                  style={{ fontSize: "24px" }}
                />
              </div>

              <h1 className={styles["form-title"]}>Reset Password</h1>
              <p className={styles["form-subtitle"]}>
                Create a new secure password for your account.
              </p>

              {resetError && (
                <Message severity="error" text={resetError} className="mb-3" />
              )}

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
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Password must contain uppercase, lowercase and number",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="form-item">
                      <label className="form-label">New Password *</label>
                      <Password
                        {...field}
                        placeholder="Enter new password"
                        toggleMask
                        className={fieldState.error ? "p-invalid " : ""}
                        feedback={true}
                        inputClassName="w-100"
                        promptLabel="Choose a password"
                        weakLabel="Too simple"
                        mediumLabel="Average complexity"
                        strongLabel="Complex password"
                      />
                      {getFormErrorMessage("password")}
                    </div>
                  )}
                />
              </div>

              <div className="form-group">
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  }}
                  render={({ field, fieldState }) => (
                    <div className="form-item">
                      <label className="form-label">Confirm Password *</label>
                      <Password
                        {...field}
                        placeholder="Confirm new password"
                        toggleMask
                        className={fieldState.error ? "p-invalid " : ""}
                        feedback={false}
                        inputClassName="w-100"
                      />
                      {getFormErrorMessage("confirmPassword")}
                    </div>
                  )}
                />
              </div>

              <Button
                label={isLoading ? "Resetting..." : "Reset Password"}
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
                className="login-button w-100"
                disabled={isLoading}
              />

              <div className={styles["register-section"]}>
                <p className="text-muted mb-0">
                  Remember your password?{" "}
                  <a
                    href="#"
                    className={styles["register-link"]}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(RouteConstant.Auth.Login);
                    }}
                  >
                    Back to Login
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
