import axios from "axios";
import { tokenService } from "../token-service/token-service";
import { Navigate } from "react-router";

export const baseUrl = `http://localhost:3000`;
// const apiKey = "aqowf9iavo2hoig0fyi0w3q4mzw7nopic858xbuc";

export enum HTTP_RESPONSE {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  UNPROCESSABLE_ENTITY = 422,
  REQUEST_SUCCESS = 10000,
  TOKEN_EXPIRED = 10003,
  RESPONSE_ERROR = 10005,
}

export let axiosInstance: any;
axiosInstance = axios.create({
  baseURL: baseUrl,
});

// axiosInstance.defaults.headers.common["x-api-key"] = apiKey;
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    const domain = tokenService.getDomain();
    if (domain) {
      config.headers["x-subdomain"] = domain;
    }
    const origin = tokenService.getOrigin();
    if (origin) {
      config.headers["x-origin"] = origin;
    }
    return config;
  },
  (error: any) => {
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: any) => {
    return response?.data;
  },
  (error: any) => {
    if (
      error?.response?.data?.message &&
      typeof error?.response?.data?.message === "string"
    ) {
      // replace withn toaster
      console.log(error?.response?.data?.message, "error");
    }
    if (error?.response?.status === HTTP_RESPONSE.UNAUTHORIZED) {
      Navigate({ to: "/login" });
    }
    return Promise.reject(error);
  }
);
