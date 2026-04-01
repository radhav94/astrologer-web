import axios from "axios";
import { Toast } from "../../components";
import { getToken } from "../../utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let unAuthorizedCount = 0;
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const privateRequest = axios.create({
  baseURL: `${BASE_URL}/api/` ,
  headers: {
    "Content-Type": "application/json",
    
  },
});

privateRequest.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("verifyOtpToken");
    const role = localStorage.getItem("shubhtalk_role");
const token =
  role === "ASTROLOGER"
    ? localStorage.getItem("shubhtalk_astro_token")
    : localStorage.getItem("shubhtalk_customer_token");


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const requestHandler = (request) => {
  const token = getToken() || "";
  const controller = new AbortController();
  if (!token) {
    controller.abort();
  }
  request.headers.Authorization = `Bearer ${token}`;
  return { ...request, signal: controller.signal };
};

const clearToken = () => {
  localStorage.removeItem("shubhtalk_astro_token");
};

const responseErrorHandler = (error) => {
  if (error.response) {
    const { status, data, message } = error.response;

    switch (status) {
      case 401:
        if (!unAuthorizedCount) {
          unAuthorizedCount++;
          clearToken();
          Toast.error("Session expired, please login again!");
          setTimeout(() => {
            unAuthorizedCount = 0;
            window.location.href = "/";
          }, 300);
        }
        break;
      case 400:
        Toast.error(
          data.message || data?.error || message || "Invalid Value/ Bad Request"
        );
        break;
      case 403:
        Toast.error(
          data.message || data?.error || message || "Access Denied/ Forbidden"
        );
        break;
      case 404:
        Toast.error(
          data.message || data?.error || message || "Item doesn't exist"
        );
        break;
      case 405:
        Toast.error(
          data.message || data?.error || message || "Invalid Request"
        );
        break;
      case 422:
        Toast.error(data.message || data?.error || message || "Already Exists");
        break;
      case 504:
        Toast.error(data.message || data?.error || message || "Network Error");
        break;
      default:
        Toast.error(
          data.message || data?.error || message || "Some Error Occurred"
        );
        break;
    }
  } else if (error?.code === "ERR_CANCELED") {
    return Promise.reject(error);
  } else {
    Toast.error(error?.message || "Some Error Occurred");
  }
  return Promise.reject(error);
};

const errorHandler = (error) => {
  return Promise.reject(error);
};

privateRequest.interceptors.request.use(requestHandler, errorHandler);

privateRequest.interceptors.response.use(
  (response) => response,
  responseErrorHandler
);

export const privateGet = (endPoint, config = {}) => {
  return privateRequest.get(`${endPoint}`, config);
};

export const privatePost = (endPoint, data, config = {}) => {
  return privateRequest.post(endPoint, data, config);
};

export const privatePut = (endPoint, id, data, config = {}) => {
  const url = id ? `${endPoint}/${id}` : endPoint;
  return privateRequest.put(url, data, config);
};

export const privatePatch = (endPoint, id, data, config = {}) => {
  const url = id ? `${endPoint}/${id}` : endPoint;
  return privateRequest.patch(url, data, config);
};

export const privateDelete = (endPoint, id, config = {}) => {
  return privateRequest.delete(`${endPoint}${id ? `/${id}` : ""}`, config);
};

export default privateRequest;

// Create the RTK Query API
export const privateApi = createApi({
  reducerPath: "privateApi",

  baseQuery: async (args, api, extraOptions) => {
    const rawBaseQuery = fetchBaseQuery({
      baseUrl: `${BASE_URL}/api/`,
      prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");

        const role = localStorage.getItem("shubhtalk_role");
        const token =
          role === "ASTROLOGER"
            ? localStorage.getItem("shubhtalk_astro_token")
            : localStorage.getItem("shubhtalk_customer_token");

        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
      },
    });

    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
      responseErrorHandler(result.error);
    }

    return result;
  },

  tagTypes: ["Chat", "User"],

  endpoints: () => ({}), // Empty for now, will inject endpoints later
});