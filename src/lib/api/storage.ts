import supabase from '@/lib/supabase';

export async function uploadItemImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('ログインが必要です');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // ファイルサイズチェック（5MB制限）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('ファイルサイズは5MB以下である必要があります');
  }

  // ファイル形式チェック
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!fileExt || !allowedTypes.includes(fileExt)) {
    throw new Error('対応していないファイル形式です（jpg, png, gif, webpのみ）');
  }

  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('item-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteItemImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    // URLからファイル名を抽出
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/item-images/');

    if (pathParts.length < 2) {
      console.warn('Invalid image URL format:', imageUrl);
      return;
    }

    const fileName = pathParts[1];

    const { error } = await supabase.storage
      .from('item-images')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error parsing image URL:', error);
    throw error;
  }
}

export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.includes('/item-images/') || urlObj.pathname.includes('/item-documents/');
  } catch {
    return false;
  }
}

// 書類アップロード関数（保証書、領収書、取扱説明書）
export async function uploadItemDocument(
  file: File,
  type: 'warranty' | 'receipt' | 'manual'
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('ログインが必要です');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const timestamp = Date.now();
  const fileName = `${user.id}/${type}_${timestamp}.${fileExt}`;

  // ファイルサイズチェック（10MB制限）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('ファイルサイズは10MB以下である必要があります');
  }

  // ファイル形式チェック
  const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  if (!fileExt || !allowedTypes.includes(fileExt)) {
    throw new Error('対応していないファイル形式です（pdf, doc, docx, jpg, pngのみ）');
  }

  const { error: uploadError } = await supabase.storage
    .from('item-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading document:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('item-documents')
    .getPublicUrl(fileName);

  return publicUrl;
}

// 書類削除関数
export async function deleteItemDocument(documentUrl: string): Promise<void> {
  if (!documentUrl) return;

  try {
    // URLからファイル名を抽出
    const url = new URL(documentUrl);
    const pathParts = url.pathname.split('/item-documents/');

    if (pathParts.length < 2) {
      console.warn('Invalid document URL format:', documentUrl);
      return;
    }

    const fileName = pathParts[1];

    const { error } = await supabase.storage
      .from('item-documents')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error parsing document URL:', error);
    throw error;
  }
}
