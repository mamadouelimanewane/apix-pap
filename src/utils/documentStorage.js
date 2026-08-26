// Gestion stockage documents cloud
// Support: Vercel Blob Storage, AWS S3, Firebase

const STORAGE_CONFIG = {
  provider: process.env.REACT_APP_STORAGE || 'vercel-blob', // 'vercel-blob', 's3', 'firebase'
  bucket: process.env.REACT_APP_STORAGE_BUCKET || 'apix-pap-documents',
  region: process.env.REACT_APP_STORAGE_REGION || 'us-east-1'
};

// Compresser image avant upload
export const compressImage = async (imageData, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = img.width;
      const height = img.height;

      // Redimensionner si trop gros (max 2000px)
      let newWidth = width;
      let newHeight = height;

      if (width > 2000) {
        newWidth = 2000;
        newHeight = Math.round((height * 2000) / width);
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = imageData;
  });
};

// Upload vers Vercel Blob Storage
export const uploadToVercelBlob = async (documentId, imageData, metadata) => {
  try {
    const blob = dataURItoBlob(imageData);
    const formData = new FormData();
    formData.append('file', blob, `${documentId}.jpg`);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');

    const result = await response.json();
    return {
      success: true,
      url: result.url,
      size: result.size,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur upload Vercel Blob:', error);
    return { success: false, error: error.message };
  }
};

// Upload vers AWS S3 (présigne URL)
export const uploadToS3 = async (documentId, imageData, metadata) => {
  try {
    // 1. Obtenir presigned URL du serveur
    const presignedResponse = await fetch('/api/documents/s3/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        contentType: 'image/jpeg'
      })
    });

    const { presignedUrl, downloadUrl } = await presignedResponse.json();

    // 2. Upload directement vers S3
    const blob = dataURItoBlob(imageData);
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: blob
    });

    if (!uploadResponse.ok) throw new Error('S3 upload failed');

    // 3. Sauvegarder métadonnées en base
    await fetch('/api/documents/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        url: downloadUrl,
        metadata,
        uploadedAt: new Date().toISOString()
      })
    });

    return {
      success: true,
      url: downloadUrl,
      size: blob.size,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur upload S3:', error);
    return { success: false, error: error.message };
  }
};

// Upload vers Firebase Storage
export const uploadToFirebase = async (documentId, imageData, metadata) => {
  try {
    // Initialiser Firebase (config en .env)
    const firebase = await import('firebase/app');
    const storage = await import('firebase/storage');

    const { ref, uploadBytes, getDownloadURL } = storage;
    const db = firebase.initializeApp({
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    });

    // Upload fichier
    const blob = dataURItoBlob(imageData);
    const fileRef = ref(storage.getStorage(db), `documents/${documentId}.jpg`);

    await uploadBytes(fileRef, blob);
    const downloadUrl = await getDownloadURL(fileRef);

    return {
      success: true,
      url: downloadUrl,
      size: blob.size,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur upload Firebase:', error);
    return { success: false, error: error.message };
  }
};

// Dispatcher vers bon provider
export const uploadDocument = async (documentId, imageData, metadata) => {
  // Compresser d'abord
  const compressed = await compressImage(imageData, 0.8);

  switch (STORAGE_CONFIG.provider) {
    case 'vercel-blob':
      return uploadToVercelBlob(documentId, compressed, metadata);
    case 's3':
      return uploadToS3(documentId, compressed, metadata);
    case 'firebase':
      return uploadToFirebase(documentId, compressed, metadata);
    default:
      return { success: false, error: 'Provider non configuré' };
  }
};

// Utilitaire: DataURI -> Blob
const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].match(/:(.*?);/)[1];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

// Versioning documents
export const createDocumentVersion = async (documentId, version, data) => {
  return fetch('/api/documents/versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId,
      version,
      data,
      createdAt: new Date().toISOString()
    })
  }).then(r => r.json());
};

// Supprimer document
export const deleteDocument = async (documentId) => {
  return fetch(`/api/documents/${documentId}`, {
    method: 'DELETE'
  }).then(r => r.json());
};

export default {
  uploadDocument,
  compressImage,
  createDocumentVersion,
  deleteDocument,
  STORAGE_CONFIG
};
