import { baseApi } from "../api/baseapi";

export const RestaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addRestaurant: builder.mutation({
      query: (data) => ({
        url: `/api/restaurants`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant"],
    }),
    getAllRestaurants: builder.query({
      query: () => ({
        url: `/api/restaurants`,
        method: "GET",
      }),
      providesTags: ["Restaurant"],
    }),
    getSingleRestaurant: builder.query({
      query: (id) => ({
        url: `api/restaurants/${id}`,
        method: "GET",
      }),
      providesTags: ["Restaurant"],
    }),
    updateRestaurantInfo: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/restaurants/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Restaurant"],
    }),
    getSingleRestaurantMenu: builder.query({
      query: (id) => ({
        url: `api/restaurants/${id}/menu`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Menu"],
    }),

    addNewMenu: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/restaurants/${id}/menu`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant", "Menu"],
    }),
    uploadNewMenuPdf: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/restaurants/${id}/documents`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant", "Menu"],
    }),
    getMenuPdf: builder.query({
      query: (id) => ({
        url: `api/restaurants/${id}/documents`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Menu"],
    }),
    deleteMenuPdf: builder.mutation({
      query: ({ id, uid }) => ({
        url: `api/restaurants/${id}/documents/${uid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurant", "Menu"],
    }),
    getDashboard: builder.query({
      query: (id) => ({
        url: `api/restaurants/${id}/dashboard`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Dashboard"],
    }),
    addNewTable: builder.mutation({
      query: ({ id, data }) => ({
        url: `api/restaurants/${id}/tables`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant", "Table"],
    }),
    getTables: builder.query({
      query: ({ id, reservation_date, reservation_time }) => {
        let url = `api/restaurants/${id}/tables/available`;
        const params = new URLSearchParams();
        if (reservation_date) params.append("reservation_date", reservation_date);
        if (reservation_time) params.append("reservation_time", reservation_time);
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Restaurant", "Table"],
    }),
    getSingleTable: builder.query({
      query: ({ id, tid }) => ({
        url: `api/restaurants/${id}/tables/${tid}`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Table"],
    }),
    getRestaurantTable: builder.query({
      query: ( id ) => ({
        url: `api/restaurants/${id}/tables`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Table"],
    }),
    deleteSingleTable: builder.mutation({
      query: ({ restaurant_id, table_id }) => ({
        url: `api/restaurants/${restaurant_id}/tables/${table_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurant", "Table"],
    }),
    updateSingleTable: builder.mutation({
      query: ({ restaurant_id, table_id, data }) => ({
        url: `api/restaurants/${restaurant_id}/tables/${table_id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Restaurant", "Table"],
    }),
    deleteSingleMenu: builder.mutation({
      query: ({ restaurant_id, menu_id }) => ({
        url: `api/restaurants/${restaurant_id}/menu/${menu_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurant", "Menu"],
    }),
    getSingleMenuItem: builder.query({
      query: ({ id, menuid }) => ({
        url: `api/restaurants/${id}/menu/${menuid}`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Menu"],
    }),
    updateSingleMenu: builder.mutation({
      query: ({ restaurant_id, menu_id, data }) => ({
        url: `api/restaurants/${restaurant_id}/menu/${menu_id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Restaurant", "Menu"],
    }),
    getMostVisitedAnalytics: builder.query({
      query: ({ restaurant_id, time_range, start_date, end_date }) => {
        let url = `api/restaurants/${restaurant_id}/analytics/most-visited`;

        const queryParams = [];
        if (time_range) {
          queryParams.push(`time_range=${time_range}`);
        } else if (start_date && end_date) {
          queryParams.push(`start_date=${start_date}`, `end_date=${end_date}`);
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Restaurant", "Analytics"],
    }),
    getTopDishesAnalytics: builder.query({
      query: ({
        restaurant_id,
        time_range,
        start_date,
        end_date,
        category,
      }) => {
        let url = `api/restaurants/${restaurant_id}/analytics/top-dishes`;

        const queryParams = [];
        if (time_range) {
          queryParams.push(`time_range=${time_range}`);
        } else if (start_date && end_date) {
          queryParams.push(`start_date=${start_date}`, `end_date=${end_date}`);
        }

        if (category) {
          queryParams.push(`category=${category}`);
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Restaurant", "Analytics"],
    }),

    getMessageTemplates: builder.query({
      query: (id) => ({
        url: `api/restaurants/${id}/message-templates`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "MessageTemplates"],
    }),

    getRestaurantPromotions: builder.query({
      query: (id) => ({
        url: `api/restaurants/${id}/promotions`,
        method: "GET",
      }),
      providesTags: ["Restaurant", "Promotion"],
    }),
  }),
});

export const {
  useAddRestaurantMutation,
  useGetAllRestaurantsQuery,
  useGetSingleRestaurantQuery,
  useUpdateRestaurantInfoMutation,
  useGetSingleRestaurantMenuQuery,
  useAddNewMenuMutation,
  useDeleteSingleMenuMutation,
  useGetSingleMenuItemQuery,
  useUpdateSingleMenuMutation,
  useUploadNewMenuPdfMutation,
  useGetMenuPdfQuery,
  useDeleteMenuPdfMutation,
  useGetTablesQuery,
  useGetSingleTableQuery,
  useAddNewTableMutation,
  useDeleteSingleTableMutation,
  useUpdateSingleTableMutation,
  useGetDashboardQuery,
  useGetMostVisitedAnalyticsQuery,
  useGetTopDishesAnalyticsQuery,
  useGetMessageTemplatesQuery,
  useGetRestaurantPromotionsQuery,
  useGetRestaurantTableQuery
} = RestaurantApi;
