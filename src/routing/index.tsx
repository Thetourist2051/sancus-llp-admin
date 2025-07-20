import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login-page";
import BlogPage from "../pages/blog-page";
import ProtectedLayout from "./ProtectedLayout";
import LoaderComponent from "../components/loader";
import AddEditBlogPage from "../pages/add-edit-blog";
import UserQueryPage from "../pages/users-query-page";
import { RouteConstant } from "../constant/route-constant";
import { tokenService } from "../services/token-service/token-service";
import ResetPasswordPage from "../pages/reset-password";

export type RouteInterface = {
  id: string;
  path: string;
  element: React.ReactNode;
  modulename?: string;
  moduleicon?: string;
};

const RoutingConfig = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = tokenService.getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  const publicRoutes: RouteInterface[] = [
    {
      id: "loginPage",
      path: RouteConstant.Auth.Login,
      element: <LoginPage />,
    },
    {
      id: "resetPasswordPage",
      path: RouteConstant.Auth.ResetPassword,
      element: <ResetPasswordPage />,
    },
  ];

  const protectedRoutes: RouteInterface[] = [
    {
      id: "blogs",
      path: RouteConstant.Admin.Blogs,
      element: <BlogPage />,
      modulename: "Blogs",
      moduleicon: "et:documents",
    },
    {
      id: "userQuery",
      path: RouteConstant.Admin.Queries,
      element: <UserQueryPage />,
      modulename: "User Query(s)",
      moduleicon: "ph:users-three",
    },
    {
      id: "addEditBlog",
      path: RouteConstant.Admin.AddBlog,
      element: <AddEditBlogPage />,
    },
  ];

  if (isAuthenticated === null) {
    return <LoaderComponent />;
  }

  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoaderComponent />}>
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route) => (
            <Route key={route.id} path={route.path} element={route.element} />
          ))}

          {/* Protected Layout */}
          <Route
            element={
              isAuthenticated ? (
                <ProtectedLayout
                  ProtectedRoutes={protectedRoutes.filter((r) => r.modulename)}
                />
              ) : (
                <Navigate to={RouteConstant.Auth.Login} replace />
              )
            }
          >
            {protectedRoutes.map((route) => (
              <Route key={route.id} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? RouteConstant.Admin.Blogs
                    : RouteConstant.Auth.Login
                }
                replace
              />
            }
          />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default RoutingConfig;
