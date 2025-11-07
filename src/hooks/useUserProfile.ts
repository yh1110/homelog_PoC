import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/lib/supabase';
import type { UserProfile, UpdateUserProfileInput } from '@/types/userProfile';
import { toast } from 'sonner';

// ユーザープロファイルを取得
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // プロファイルが存在しない場合は作成
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        throw insertError;
      }

      return newProfile;
    }

    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
}

// ユーザープロファイルを更新
export async function updateUserProfile(
  userId: string,
  updates: UpdateUserProfileInput
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

// React Queryフック: プロファイル取得
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => (userId ? getUserProfile(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分
  });
}

// React Queryフック: プロファイル更新
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: UpdateUserProfileInput }) =>
      updateUserProfile(userId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    },
    onError: (error) => {
      console.error('Update profile error:', error);
      const message = error instanceof Error ? error.message : 'プロファイルの更新に失敗しました';
      toast.error(message);
    },
  });
}
