import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../fetcher";

interface Icone {
  id: string;
  name: string;
  iconUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface IconesResponse {
  success: boolean;
  count: number;
  data: Icone[];
}

interface CreateIconeData {
  name: string;
  userId: string;
  iconUrl: string;
}

// Fetch all icons for a user
export function useIcones(userId: string | null) {
  return useQuery<IconesResponse>({
    queryKey: ["icones", userId],
    queryFn: () =>
      fetcher<IconesResponse>(`/icone/all-icone?userId=${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create a new icon
export function useCreateIcone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIconeData) =>
      fetcher<{ success: boolean; message: string; data: Icone }>(
        "/icone/create",
        {
          method: "POST",
          data: data,
        }
      ),
    onSuccess: (_, variables) => {
      // Invalidate the icones query to refetch
      queryClient.invalidateQueries({ queryKey: ["icones", variables.userId] });
    },
  });
}
