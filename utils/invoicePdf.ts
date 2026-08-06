import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export async function fetchInvoiceRemoteUrl(
  baseUrl: string,
  orderId: string,
  token: string
): Promise<string> {
  const response = await axios.get(`${baseUrl}/ecart/user/order/get-invoice/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const url = response.data?.url;
  if (!url) {
    throw new Error('Invoice URL not found');
  }

  return url;
}

export async function downloadInvoicePdf(remoteUrl: string, orderId: string): Promise<string> {
  const fileUri = `${FileSystem.documentDirectory}invoice-${orderId}.pdf`;
  const { uri } = await FileSystem.downloadAsync(remoteUrl, fileUri);
  return uri;
}

export async function shareLocalPdf(localUri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri, {
      UTI: 'com.adobe.pdf',
      mimeType: 'application/pdf',
    });
    return;
  }

  Alert.alert('Download complete', `File saved at: ${localUri}`);
}
