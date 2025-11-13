import { baseApi } from "../api/baseapi";

export const PromotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addNewPromotion: builder.mutation({
      query: (data) => ({
        url: `/api/promotions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Promotion", "Dashboard"],
    }),
    getAllPromotions: builder.query({
      query: () => ({
        url: `/api/promotions`,
        method: "GET",
      }),
      providesTags: ["Promotion", "Dashboard"],
    }),
    getSinglePromotions: builder.query({
      query: (id) => ({
        url: `api/promotions/${id}`,
        method: "GET",
      }),
      providesTags: ["Promotion", "Dashboard"],
    }),
    updatePromotionInfo: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/promotions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Promotion", "Dashboard"],
    }),
    deletePromotion: builder.mutation({
      query: (id) => ({
        url: `/api/promotions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Promotion", "Dashboard"],
    }),
    getSentLogs: builder.query({
      query: ({ id, ordering ,page}: { id: string; ordering: string; page: number }) => ({
        url: `api/promotions/${id}/sent-logs?ordering=${ordering}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["Promotion"],
    }),
  }),
});

export const {
  useAddNewPromotionMutation,
  useGetAllPromotionsQuery,
  useGetSinglePromotionsQuery,
  useUpdatePromotionInfoMutation,
  useDeletePromotionMutation,
  useGetSentLogsQuery
} = PromotionApi;
