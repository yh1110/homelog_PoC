import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, createItem, updateItem, deleteItem, type Item, type CreateItemInput, type UpdateItemInput } from '@/lib/api/items';
import { deleteItemImage, isSupabaseStorageUrl } from '@/lib/api/storage';
import { toast } from 'sonner';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: getItems,
    staleTime: 1000 * 60 * 5, // 5分
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('アイテムを追加しました');
    },
    onError: (error) => {
      console.error('Create item error:', error);
      const message = error instanceof Error ? error.message : 'アイテムの追加に失敗しました';
      toast.error(message);
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateItemInput }) =>
      updateItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('アイテムを更新しました');
    },
    onError: (error) => {
      console.error('Update item error:', error);
      const message = error instanceof Error ? error.message : 'アイテムの更新に失敗しました';
      toast.error(message);
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Item) => {
      // 画像がSupabase Storageにある場合は削除
      if (item.image_url && isSupabaseStorageUrl(item.image_url)) {
        try {
          await deleteItemImage(item.image_url);
        } catch (error) {
          console.error('Failed to delete image:', error);
          // 画像削除失敗してもアイテム削除は続行
        }
      }

      // アイテム削除
      await deleteItem(item.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('アイテムを削除しました');
    },
    onError: (error) => {
      console.error('Delete item error:', error);
      const message = error instanceof Error ? error.message : 'アイテムの削除に失敗しました';
      toast.error(message);
    },
  });
}
