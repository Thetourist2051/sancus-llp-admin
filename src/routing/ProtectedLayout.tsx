import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import style from "./index.module.scss";
import type { RouteInterface } from ".";
import { Icon } from "@iconify/react/dist/iconify.js";
import { tokenService } from "../services/token-service/token-service";
import { RouteConstant } from "../constant/route-constant";
import { showToast } from "../services/toaster-service";

interface ProtectedLayoutProps {
  ProtectedRoutes: RouteInterface[];
}

const ProtectedLayout = React.memo(
  ({ ProtectedRoutes }: ProtectedLayoutProps) => {
    const [currentRoute, setCurrentRoute] = useState<RouteInterface>(
      ProtectedRoutes[0]
    );
    console.log("in Protected Route");
    const navigate = useNavigate();
    const userInfo = tokenService.retrieveUserInfo();
    console.log("userInfo", userInfo);

    const [sidenavCollapsed, setSidenavCollapsed] = useState<boolean>(false);

    const onLogout = () => {
      tokenService.clearAllToken();
      showToast(
        "success",
        "Logout",
        "You have successfully logged-out !",
        300000
      );
      navigate(RouteConstant.Auth.Login);
    };

    return (
      <>
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
              <div className={style["avatar-section"]}>
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
