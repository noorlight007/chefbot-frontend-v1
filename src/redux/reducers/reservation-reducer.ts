import { baseApi } from "../api/baseapi";

export const ReservationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addReservation: builder.mutation({
      query: (data) => ({
        url: `/api/reservations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reservation", "Dashboard"],
    }),
    getAllReservations: builder.query({
      query: (params) => ({
        url: `/api/reservations`,
        method: "GET",
        params: {
          reservation_date_after: params?.reservation_date_after || undefined,
          reservation_date_before: params?.reservation_date_before || undefined,
          reservation_status: params?.reservation_status || undefined,
          cancelled_by: params?.cancelled_by || undefined,
          search: params?.search || undefined,
        },
      }),
      providesTags: ["Reservation", "Dashboard"],
    }),
    getSingleReservation: builder.query({
      query: (uid) => ({
        url: `/api/reservations/${uid}`,
        method: "GET",
      }),
      providesTags: ["Reservation", "Dashboard"],
    }),
    deleteSingleReservation: builder.mutation({
      query: (uid) => ({
        url: `/api/reservations/${uid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reservation", "Dashboard"],
    }),
    updateReservation: builder.mutation({
      query: ({ uid, data }) => ({
        url: `/api/reservations/${uid}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Reservation", "Dashboard"],
    }),
    getAllClients: builder.query({
      query: ({ page }) => ({
        url: `/api/clients`,
        method: "GET",
        params: {
          page: page || undefined,
        },
      }),
      providesTags: ["Reservation", "User", "Dashboard"],
    }),
    updateSpecialNotes: builder.mutation({
      query: ({ uid, data }) => ({
        url: `/api/clients/${uid}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Reservation", "User", "Dashboard"],
    }),
    getResevationMessageHistory: builder.query({
      query: (uid) => ({
        url: `/api/reservations/${uid}/messages`,
        method: "GET",
      }),
      providesTags: ["Reservation", "Messages"],
    }),
  }),
});

export const {
  useGetAllReservationsQuery,
  useAddReservationMutation,
  useGetSingleReservationQuery,
  useDeleteSingleReservationMutation,
  useUpdateReservationMutation,
  useGetAllClientsQuery,
  useGetResevationMessageHistoryQuery,
  useUpdateSpecialNotesMutation,
} = ReservationApi;
