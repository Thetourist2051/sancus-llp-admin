import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Controller, useForm } from "react-hook-form";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { Icon } from "@iconify/react";
import { HTTPService } from "../../services/http-service/http-service";
import { showToast } from "../../services/toaster-service";
import { useNavigate } from "react-router";
import { RouteConstant } from "../../constant/route-constant";
import styles from "./index.module.scss";
import { tokenService } from "../../services/token-service/token-service";

interface ChangePasswordDialogProps {
  visible: boolean;
  onHide: () => void;
}

interface ChangePasswordFormData {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  visible,
  onHide,
}) => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { control, watch, handleSubmit } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const currentPassword = watch("currentPassword");

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    try {
      const response = await HTTPService.putRequest("/admin/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.password,
      });

      if (response?.success) {
        showToast("success", "Success", "Password changed successfully.");
        navigate(RouteConstant.Auth.Login);
        tokenService.clearAllToken();
        onHide();
      } else {
        showToast(
          "error",
          "Reset Failed",
          response?.message || "Unknown error."
        );
      }
    } catch (error) {
      showToast(
        "error",
        "Reset Failed",
        "Failed to reset password. Please check your current password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    // Check each criterion individually
    const hasMinLength = password.length >= 6;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    // Count how many criteria are met
    let strength = 0;
    if (hasMinLength) strength += 1;
    if (hasLowercase) strength += 1;
    if (hasUppercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecialChar) strength += 1;

    // Define labels and colors based on criteria met
    const strengthLevels = [
      { label: "Very Weak", color: styles.strengthVeryWeak }, // 0 criteria
      { label: "Weak", color: styles.strengthWeak }, // 1 criteria
      { label: "Fair", color: styles.strengthFair }, // 2 criteria
      { label: "Good", color: styles.strengthGood }, // 3-4 criteria
      { label: "Strong", color: styles.strengthStrong }, // All 5 criteria
    ];

    // Only show "Strong" if ALL criteria are met
    let levelIndex;
    if (strength === 5) {
      levelIndex = 4; // Strong - all criteria met
    } else if (strength >= 3) {
      levelIndex = 3; // Good - 3-4 criteria met
    } else {
      levelIndex = Math.min(strength, 2); // Very Weak, Weak, or Fair
    }

    return {
      strength: Math.min(strength - 1, 4), // Adjust for 0-4 scale for UI bars
      label: strengthLevels[levelIndex].label,
      color: strengthLevels[levelIndex].color,
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const CustomHeader = () => (
    <div className={styles.customHeader}>
      <div className={styles.headerIconWrapper}>
        <div className={styles.headerIcon}>
          <Icon
            icon="heroicons:lock-closed-20-solid"
            className={styles.lockIcon}
          />
        </div>
        <div className={styles.sparkleIcon}>
          <Icon icon="heroicons:sparkles-20-solid" className={styles.sparkle} />
        </div>
      </div>
      <div className={styles.headerContent}>
        <h2 className={styles.headerTitle}>Reset Password</h2>
        <p className={styles.headerSubtitle}>Create a new secure password</p>
      </div>
    </div>
  );

  const dialogPassthrough = {
    root: { className: styles.dialogRoot },
    header: { className: styles.dialogHeader },
    content: { className: styles.dialogContent },
    mask: { className: styles.dialogMask },
  };

  const passwordPassthrough = {
    root: { className: styles.passwordRoot },
    input: { className: styles.passwordInput },
    panel: { className: styles.passwordPanel },
  };

  const buttonPassthrough = {
    root: {
      className: classNames(styles.submitButton, { 
        [styles.loading]: loading
      }),
    },
    label: { className: styles.buttonLabel },
  };

  return (
    <Dialog
      header={<CustomHeader />}
      visible={visible}
      onHide={onHide}
      breakpoints={{ "768px": "90vw" }}
      style={{ width: "480px" }}
      modal
      pt={dialogPassthrough}
    >
      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          {/* Current Password Field */}
          <div className={styles.fieldGroup}>
            <Controller
              name="currentPassword"
              control={control}
              rules={{
                required: "Current password is required",
              }}
              render={({ field, fieldState }) => (
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>Current Password</label>
                  <div className={styles.inputGroup}>
                    <div
                      className={classNames(styles.inputGlow, {
                        [styles.active]: field.value,
                      })}
                    />
                    <div
                      className={classNames(styles.inputContainer, {
                        [styles.invalid]: fieldState.invalid,
                      })}
                    >
                      <Password
                        {...field}
                        placeholder="Enter your current password"
                        toggleMask
                        feedback={false}
                        pt={passwordPassthrough}
                      />
                    </div>
                  </div>

                  {fieldState.error && (
                    <div className={styles.errorMessage}>
                      <Icon
                        icon="heroicons:exclamation-circle-20-solid"
                        className={styles.errorIcon}
                      />
                      <span>{fieldState.error.message}</span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Password Field */}
          <div className={styles.fieldGroup}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
                  message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                },
                validate: (value) => 
                  value !== currentPassword || "New password must be different from current password",
              }}
              render={({ field, fieldState }) => (
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>New Password</label>
                  <div className={styles.inputGroup}>
                    <div
                      className={classNames(styles.inputGlow, {
                        [styles.active]: field.value,
                      })}
                    />
                    <div
                      className={classNames(styles.inputContainer, {
                        [styles.invalid]: fieldState.invalid,
                      })}
                    >
                      <Password
                        {...field}
                        placeholder="Enter your new password"
                        toggleMask
                        feedback={false}
                        pt={passwordPassthrough}
                      />
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className={styles.strengthIndicator}>
                      <div className={styles.strengthHeader}>
                        <span className={styles.strengthLabel}>
                          Password Strength
                        </span>
                        <span
                          className={classNames(
                            styles.strengthValue,
                            passwordStrength.color
                          )}
                          style={{ background: "transparent" }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className={styles.strengthBars}>
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={classNames(
                              styles.strengthBar,
                              i <= passwordStrength.strength
                                ? passwordStrength.color
                                : styles.strengthEmpty
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {fieldState.error && (
                    <div className={styles.errorMessage}>
                      <Icon
                        icon="heroicons:exclamation-circle-20-solid"
                        className={styles.errorIcon}
                      />
                      <span>{fieldState.error.message}</span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Confirm Password Field */}
          <div className={styles.fieldGroup}>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              }}
              render={({ field, fieldState }) => (
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>Confirm Password</label>
                  <div className={styles.inputGroup}>
                    <div
                      className={classNames(styles.inputGlow, {
                        [styles.active]: field.value,
                      })}
                    />
                    <div
                      className={classNames(styles.inputContainer, {
                        [styles.invalid]: fieldState.invalid,
                      })}
                    >
                      <Password
                        {...field}
                        placeholder="Confirm your password"
                        toggleMask={false}
                        feedback={false}
                        pt={passwordPassthrough}
                      />
                      <div className={styles.inputIcon}>
                        {field.value && field.value === password ? (
                          <Icon
                            icon="heroicons:check-circle-20-solid"
                            className={styles.successIcon}
                          />
                        ) : (
                          <Icon icon="heroicons:lock-closed-20-solid" />
                        )}
                      </div>
                    </div>
                  </div>

                  {fieldState.error && (
                    <div className={styles.errorMessage}>
                      <Icon
                        icon="heroicons:exclamation-circle-20-solid"
                        className={styles.errorIcon}
                      />
                      <span>{fieldState.error.message}</span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <Button
              loading={loading}
              disabled={loading}
              onClick={handleSubmit(handleFormSubmit)}
              pt={buttonPassthrough}
            >
              <div className={styles.buttonContent}>
                {loading ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Icon
                      icon="heroicons:lock-closed-20-solid"
                      className={styles.buttonIcon}
                    />
                    <span>Reset Password</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ChangePasswordDialog;