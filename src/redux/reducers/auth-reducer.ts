import { baseApi } from "../api/baseapi";

export const AuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (data) => ({
        url: `/api/token`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    registerUser: builder.mutation({
      query: (data) => ({
        url: `/api/auth/registration`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    setPassword: builder.mutation({
      query: ({ sessionId, data }) => ({
        url: `/api/auth/${sessionId}/password-set`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: `/api/auth/change-password`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getLoggedUser: builder.query({
      query: () => ({
        url: `/api/auth/me`,
        method: "GET",
      }),
      providesTags: [
        "User",
        "Promotion",
        "Restaurant",
        "Reservation",
        "Menu",
        "Bot",
        "Table",
      ],
    }),
    updateUserInfo: builder.mutation({
      query: (data) => ({
        url: `/api/auth/me`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        "User",
        "Promotion",
        "Restaurant",
        "Reservation",
        "Menu",
        "Bot",
        "Table",
      ],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useSetPasswordMutation,
  useGetLoggedUserQuery,
  useUpdateUserInfoMutation,
  useChangePasswordMutation,
} = AuthApi;
