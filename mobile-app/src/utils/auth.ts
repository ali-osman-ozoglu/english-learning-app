import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const UUID_KEY = 'user_unique_id';

/**
 * Cihazda kayıtlı bir UUID varsa getirir, yoksa yeni bir tane oluşturup kaydeder.
 * iOS'ta Keychain'de tutulduğu için uygulama silinse bile (iCloud Keychain açıksa) korunur.
 * Android'de EncryptedSharedPreferences içinde tutulur ve Auto Backup ile Drive'a yedeklenir.
 */
export const getOrCreateUUID = async (): Promise<string> => {
  try {
    let uuid = await SecureStore.getItemAsync(UUID_KEY);
    
    if (!uuid) {
      uuid = Crypto.randomUUID();
      await SecureStore.setItemAsync(UUID_KEY, uuid);
    }
    
    return uuid;
  } catch (error) {
    console.error('UUID oluşturulurken/okunurken hata:', error);
    // Güvenli depolama hatası olursa geçici bir UUID oluştur (nadiren olur)
    return Crypto.randomUUID();
  }
};

/**
 * "Cihazımı Değiştir" işlemi başarıyla sonuçlandığında eski UUID'yi yenisiyle günceller.
 */
export const updateUUID = async (newUuid: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(UUID_KEY, newUuid);
  } catch (error) {
    console.error('UUID güncellenirken hata:', error);
  }
};
