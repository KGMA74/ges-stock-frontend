import { Permission } from "@/lib/types";
import api from "@/services/api";
import { useMutation } from "@tanstack/react-query";

export const useRegisterTransactionMutation = () => { 
    return useMutation({
        mutationFn: async (data: {
            fullname: string,
            phone_number: string,
            motif: string,
            amount: number,
            payment_list: number
        }) => {
            await api.post('transactions/', data)
        } 
    });
}