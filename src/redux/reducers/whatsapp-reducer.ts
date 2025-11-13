import { baseApi } from "../api/baseapi";

export const WhatsappApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addWhatsappBot: builder.mutation({
      query: (data) => ({
        url: `/api/whatsapp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bot"],
    }),

    getWhatsappBots: builder.query({
      query: () => ({
        url: `/api/whatsapp`,
        method: "GET",
      }),
      providesTags: ["Bot"],
    }),
    getSingleWhatsappBot: builder.query({
      query: (uid) => ({
        url: `/api/whatsapp/${uid}`,
        method: "GET",
      }),
      providesTags: ["Bot"],
    }),
    updateWhatsappBot: builder.mutation({
      query: ({ uid, data }) => ({
        url: `/api/whatsapp/${uid}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Bot"],
    }),
    getWhatsappBotClients: builder.query({
      query: ({ uid, page }) => ({
        url: `/api/whatsapp/${uid}/clients`,
        method: "GET",
        params: {
          page: page || undefined,
        },
      }),
      providesTags: ["Bot"],
    }),
    getClientsMessages: builder.query({
      query: (uid) => ({
        url: `/api/clients/${uid}/messages`,
        method: "GET",
      }),
      providesTags: ["Bot","User"],
    }),
    
  }),
});

export const {
    useAddWhatsappBotMutation,
    useGetWhatsappBotsQuery,
    useGetSingleWhatsappBotQuery,
    useUpdateWhatsappBotMutation,
    useGetWhatsappBotClientsQuery,
    useGetClientsMessagesQuery




  
} = WhatsappApi;
