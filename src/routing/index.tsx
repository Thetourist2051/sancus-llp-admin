import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedLayout from "./ProtectedLayout";
import LoaderComponent from "../components/loader";
import { RouteConstant } from "../constant/route-constant";
import { tokenService } from "../services/token-service/token-service";
import ErrorBoundary from "../components/error-boundary";

// Lazy-loaded components
const LoginPage = lazy(() => import("../pages/login-page"));
const BlogPage = lazy(() => import("../pages/blog-page"));
const AddEditBlogPage = lazy(() => import("../pages/add-edit-blog"));
const UserQueryPage = lazy(() => import("../pages/users-query-page"));

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
    }
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
      <ErrorBoundary>
        <Suspense fallback={<LoaderComponent />}>
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map((route) => (
              <Route
                key={route.id}
                path={route.path}
                element={
                  <Suspense fallback={<LoaderComponent />}>
                    {route.element}
                  </Suspense>
                }
              />
            ))}

            {/* Protected Layout */}
            <Route
              element={
                isAuthenticated ? (
                  <ProtectedLayout
                    ProtectedRoutes={protectedRoutes.filter(
                      (r) => r.modulename
                    )}
                  />
                ) : (
                  <Navigate to={RouteConstant.Auth.Login} replace />
                )
              }
            >
              {protectedRoutes.map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoaderComponent />}>
                      {route.element}
                    </Suspense>
                  }
                />
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
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default RoutingConfig;
