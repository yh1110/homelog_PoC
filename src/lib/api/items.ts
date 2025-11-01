import supabase from '@/lib/supabase';

export type Item = {
  id: string;
  user_id: string;
  category_id: 'furniture' | 'appliance';
  name: string;
  purchase_date: string;
  price?: number;
  manufacturer?: string;
  model_number?: string;
  official_page?: string;
  notes?: string;
  image_url?: string;
  warranty_url?: string;
  receipt_url?: string;
  manual_url?: string;
  created_at: string;
  updated_at: string;
};

export type CreateItemInput = Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateItemInput = Partial<CreateItemInput>;

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('purchase_date', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  return data as Item[];
}

export async function getItemById(id: string): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    throw error;
  }

  return data as Item;
}

export async function createItem(item: CreateItemInput): Promise<Item> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('ログインが必要です');
  }

  const { data, error } = await supabase
    .from('items')
    .insert([{
      ...item,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    throw error;
  }

  return data as Item;
}

export async function updateItem(id: string, updates: UpdateItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating item:', error);
    throw error;
  }

  return data as Item;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}
