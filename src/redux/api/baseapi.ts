"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASEURL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 (Unauthorized), try to refresh the token
  if (result.error && result.error.status === 401) {
    // Get the stored refresh token
    const refreshToken = localStorage.getItem("refreshToken");

    // Try to get a new token using the refresh token
    const refreshResult = await baseQuery(
      {
        url: "/api/token/refresh",
        method: "POST",
        body: { refresh: refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Store the new token
      const newToken = (refreshResult.data as { access: string }).access;
      const newRefreshToken = (refreshResult.data as { refresh: string })
        .refresh;
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Restaurant",
    "Menu",
    "Bot",
    "Reservation",
    "Table",
    "Promotion",
    "Dashboard",
    "Analytics",
    "Messages",
    "MessageTemplates",
  ],
  endpoints: () => ({}),
});
