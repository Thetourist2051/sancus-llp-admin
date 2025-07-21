import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import style from "./index.module.scss";
import type { RouteInterface } from ".";
import { Icon } from "@iconify/react/dist/iconify.js";
import { tokenService } from "../services/token-service/token-service";
import { RouteConstant } from "../constant/route-constant";
import { showToast } from "../services/toaster-service";
import { OverlayPanel } from "primereact/overlaypanel";
import ChangePasswordDialog from "../pages/change-password-dialog";

interface ProtectedLayoutProps {
  ProtectedRoutes: RouteInterface[];
}

const ProtectedLayout = React.memo(
  ({ ProtectedRoutes }: ProtectedLayoutProps) => {
    const [currentRoute, setCurrentRoute] = useState<RouteInterface>(
      ProtectedRoutes[0]
    );
    console.log("In Protected Layout")
    const navigate = useNavigate();
    const userInfo = tokenService.retrieveUserInfo();
    const overlayPanelRef = useRef<OverlayPanel>(null);
    const [sidenavCollapsed, setSidenavCollapsed] = useState<boolean>(false);
    const [displayDialog, setDisplayDialog] = useState<boolean>(false);

    const onLogout = () => {
      tokenService.clearAllToken();
      showToast(
        "success",
        "Logout",
        "You have successfully logged-out !",
        3000
      );
      navigate(RouteConstant.Auth.Login);
    };

    const onOverlayPanelToggle = (e: any) => {
      if (overlayPanelRef && overlayPanelRef.current) {
        overlayPanelRef.current.toggle(e);
      }
    };

    const onResetPassword = () => {
      setDisplayDialog(true);
    };

    // useEffect(() => {
    //   const token = tokenService.getAccessToken();
    //   if (!token) {
    //     showToast("warn", "Session Expired", "Please login again.", 3000);
    //     navigate(RouteConstant.Auth.Login);
    //   }
    // }, [navigate]);
    

    return (
      <>
        <OverlayPanel ref={overlayPanelRef} closeOnEscape dismissable={true}>
          <div className={style["overlay-panel-body"]}>
            <ul className="m-0 p-0 list-unstyled">
              <li>
                <div
                  className={
                    style["panel_item"] +
                    " " +
                    "d-flex gap-2 align-items-center p-2 mb-2"
                  }
                  onClick={onResetPassword}
                >
                  <Icon
                    icon={"hugeicons:reset-password"}
                    height={24}
                    width={24}
                  ></Icon>
                  <h6 className="m-0">Reset Password</h6>
                </div>
              </li>
              <li>
                <div
                  className={
                    style["panel_item"] +
                    " " +
                    "d-flex gap-2 align-items-center p-2"
                  }
                  onClick={onLogout}
                >
                  <Icon
                    icon={"solar:logout-line-duotone"}
                    height={24}
                    width={24}
                  ></Icon>
                  <h6 className="m-0">Logout</h6>
                </div>
              </li>
            </ul>
          </div>
        </OverlayPanel>
        {
          <ChangePasswordDialog
            visible={displayDialog}
            onHide={() => setDisplayDialog(!displayDialog)}
          />
        }
        <div className={style["render-layout"]}>
          <div
            className={`${style["sidenav-section"]} ${
              sidenavCollapsed ? style["collapse-class"] : style["open-class"]
            } ${style["sidenav-border"]}`}
          >
            <div className={style["logo-section"]}>
              <span
                className={`${style["collapse-icon"]} ${style["mobile-only"]}`}
                onClick={() => setSidenavCollapsed(true)}
              >
                <Icon
                  icon={"solar:arrow-left-linear"}
                  height={20}
                  width={20}
                ></Icon>
              </span>

              <span className={style["logo-text"]}>SAS LLP</span>
            </div>

            <div className={style["nav-scroll-section"]}>
              {ProtectedRoutes.map((route: RouteInterface, index: number) => (
                <NavLink
                  key={index}
                  to={route.path}
                  className={({ isActive }) =>
                    `gap-2 ${
                      isActive ? style["nav-item-active"] : style["nav-item"]
                    }`
                  }
                  onClick={() => setCurrentRoute(route)}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        icon={route.moduleicon as string}
                        height={20}
                        width={20}
                      ></Icon>
                      <span className={style["nav-text"]}>
                        {route.modulename}
                      </span>
                      <Icon
                        icon={"solar:arrow-right-outline"}
                        height={20}
                        width={20}
                        className={
                          isActive ? style["active_arrow"] : style["hide_arrow"]
                        }
                      ></Icon>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
            <div className={style["logout-section"]} onClick={onLogout}>
              <Icon
                icon={"ant-design:poweroff-outlined"}
                height={20}
                width={20}
              ></Icon>
              <h6 className={style["logout-text"]}>Logout</h6>
            </div>
          </div>
          <div className={style["outlet-section"]}>
            <nav className={style["outlet-header"]}>
              <div className={style["header-left"]}>
                <span
                  className={`${style["expand-icon"]} ${style["mobile-only"]}`}
                  onClick={() => setSidenavCollapsed(false)}
                >
                  <Icon icon={"line-md:menu"} height={20} width={20}></Icon>
                </span>
                <h5 className={style["header-title"]}>
                  {currentRoute?.modulename}
                </h5>
              </div>
              <div
                className={style["avatar-section"]}
                onClick={onOverlayPanelToggle}
              >
                <div
                  className={style["profile-avatar"]}
                  aria-controls="ProfileMenu"
                  aria-haspopup
                >
                  <span className={style["avatar-text"]}>
                    {userInfo?.username?.[0]}
                  </span>
                </div>
              </div>
            </nav>
            <div className={style["scrollable-section"]}>
              <Outlet />
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default ProtectedLayout;
