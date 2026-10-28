package com.openciclo.app;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyPermanentlyInvalidatedException;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyStore;
import java.security.ProviderException;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Storage for the "only on this device" diary.
 *
 * The diary file holds the same AES-GCM vault blob the server would store, sealed in
 * TypeScript with the key derived from the 12-word phrase. This class never sees the
 * plaintext diary. The phrase is sealed here with an AES key that lives in Android
 * Keystore and cannot be exported. With the app lock on, that key only works right
 * after a fingerprint or screen-lock check.
 *
 * Files live in the app's private storage, which data_extraction_rules.xml keeps out of
 * backups. Never log the phrase, file contents, or exception details from crypto calls.
 */
@CapacitorPlugin(name = "DeviceVault")
public class DeviceVaultPlugin extends Plugin {

    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String KEY_PLAIN = "ciclo-device-phrase-v1";
    private static final String KEY_AUTH = "ciclo-device-phrase-auth-v1";
    private static final String DIARY_FILE = "device-diary.json";
    private static final String PHRASE_FILE = "device-phrase.bin";
    private static final String EXPORT_DIR = "exports";
    private static final byte PHRASE_FORMAT = 1;
    private static final byte MODE_PLAIN = 0;
    private static final byte MODE_AUTH = 1;
    private static final int GCM_TAG_BITS = 128;
    private static final int AUTHENTICATORS =
        BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL;

    private interface CipherAction {
        void run(Cipher cipher) throws GeneralSecurityException, IOException;
    }

    @Override
    public void load() {
        // A shared export is plaintext. Drop leftovers from the last session.
        deleteRecursively(new File(getContext().getCacheDir(), EXPORT_DIR));
    }

    @PluginMethod
    public void status(PluginCall call) {
        try {
            byte[] phrase = readOrNull(PHRASE_FILE);
            JSObject result = new JSObject();
            result.put("hasDiary", readOrNull(DIARY_FILE) != null);
            result.put("hasPhrase", phrase != null);
            result.put("phraseNeedsAuth", phrase != null && phrase.length > 1 && phrase[1] == MODE_AUTH);
            result.put("lockAvailable", lockAvailable());
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Could not read the device diary", "IO_ERROR");
        }
    }

    @PluginMethod
    public void readDiary(PluginCall call) {
        try {
            byte[] bytes = readOrNull(DIARY_FILE);
            JSObject result = new JSObject();
            if (bytes != null) result.put("data", new String(bytes, StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (IOException e) {
            call.reject("Could not read the device diary", "IO_ERROR");
        }
    }

    @PluginMethod
    public void writeDiary(PluginCall call) {
        String data = call.getString("data");
        if (data == null || data.isEmpty()) {
            call.reject("Nothing to save", "INVALID_ARGUMENT");
            return;
        }
        try {
            write(DIARY_FILE, data.getBytes(StandardCharsets.UTF_8));
            call.resolve();
        } catch (IOException e) {
            call.reject("Could not save the device diary", "IO_ERROR");
        }
    }

    /** Seals the phrase with a new Keystore key. With requireAuth, asks for a fingerprint or the screen lock first. */
    @PluginMethod
    public void storePhrase(PluginCall call) {
        String phrase = call.getString("phrase");
        boolean requireAuth = Boolean.TRUE.equals(call.getBoolean("requireAuth", false));
        if (phrase == null || phrase.isEmpty()) {
            call.reject("Missing phrase", "INVALID_ARGUMENT");
            return;
        }
        byte[] plain = phrase.getBytes(StandardCharsets.UTF_8);
        try {
            if (requireAuth) {
                if (!lockAvailable()) {
                    call.reject("No fingerprint or screen lock set up", "LOCK_UNAVAILABLE");
                    return;
                }
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.ENCRYPT_MODE, freshKey(KEY_AUTH, true));
                authenticate(call, cipher, (authorized) -> {
                    writePhrase(MODE_AUTH, authorized.getIV(), authorized.doFinal(plain));
                    deleteKey(KEY_PLAIN);
                    call.resolve();
                });
                return;
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, freshKey(KEY_PLAIN, false));
            writePhrase(MODE_PLAIN, cipher.getIV(), cipher.doFinal(plain));
            deleteKey(KEY_AUTH);
            call.resolve();
        } catch (GeneralSecurityException | IOException | ProviderException e) {
            call.reject("Could not protect the phrase", "KEY_ERROR");
        }
    }

    @PluginMethod
    public void readPhrase(PluginCall call) {
        try {
            byte[] raw = readOrNull(PHRASE_FILE);
            if (raw == null) {
                call.reject("No phrase on this device", "NO_PHRASE");
                return;
            }
            ByteBuffer buffer = ByteBuffer.wrap(raw);
            if (buffer.get() != PHRASE_FORMAT) {
                call.reject("Unknown phrase format", "KEY_ERROR");
                return;
            }
            byte mode = buffer.get();
            byte[] iv = new byte[buffer.get()];
            buffer.get(iv);
            byte[] sealed = new byte[buffer.remaining()];
            buffer.get(sealed);

            SecretKey key = existingKey(mode == MODE_AUTH ? KEY_AUTH : KEY_PLAIN);
            if (key == null) {
                call.reject("The key for this phrase is gone", "KEY_MISSING");
                return;
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            try {
                cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            } catch (KeyPermanentlyInvalidatedException e) {
                // A new fingerprint was enrolled or the screen lock was removed.
                call.reject("The key for this phrase was invalidated", "KEY_INVALIDATED");
                return;
            }
            CipherAction open = (authorized) -> {
                JSObject result = new JSObject();
                result.put("phrase", new String(authorized.doFinal(sealed), StandardCharsets.UTF_8));
                call.resolve(result);
            };
            if (mode == MODE_AUTH) {
                authenticate(call, cipher, open);
            } else {
                open.run(cipher);
            }
        } catch (GeneralSecurityException | IOException | RuntimeException e) {
            // RuntimeException covers a truncated file (BufferUnderflowException) and Keystore ProviderExceptions.
            call.reject("Could not open the phrase", "KEY_ERROR");
        }
    }

    /** Deletes the diary, the sealed phrase, and both Keystore keys. */
    @PluginMethod
    public void clear(PluginCall call) {
        atomic(DIARY_FILE).delete();
        atomic(PHRASE_FILE).delete();
        deleteKey(KEY_PLAIN);
        deleteKey(KEY_AUTH);
        if (readOrNullQuietly(DIARY_FILE) != null) {
            call.reject("Could not delete the device diary", "IO_ERROR");
            return;
        }
        call.resolve();
    }

    /** Hides the app from screenshots and the recent-apps preview. */
    @PluginMethod
    public void setSecureScreen(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        getActivity().runOnUiThread(() -> {
            if (enabled) {
                getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            } else {
                getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            }
            call.resolve();
        });
    }

    /** Opens the share sheet for a text file (diary export, phrase backup). A WebView cannot download. */
    @PluginMethod
    public void shareFile(PluginCall call) {
        String filename = call.getString("filename", "");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "text/plain");
        if (data == null || filename == null || !filename.matches("[A-Za-z0-9._-]{1,80}")) {
            call.reject("Invalid file", "INVALID_ARGUMENT");
            return;
        }
        try {
            Context context = getContext();
            File dir = new File(context.getCacheDir(), EXPORT_DIR);
            deleteRecursively(dir);
            if (!dir.mkdirs()) throw new IOException("mkdirs");
            File file = new File(dir, filename);
            try (FileOutputStream out = new FileOutputStream(file)) {
                out.write(data.getBytes(StandardCharsets.UTF_8));
            }
            Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND)
                .setType(mimeType)
                .putExtra(Intent.EXTRA_STREAM, uri)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, filename);
            getActivity().runOnUiThread(() -> {
                getActivity().startActivity(chooser);
                call.resolve();
            });
        } catch (IOException | IllegalArgumentException e) {
            call.reject("Could not share the file", "IO_ERROR");
        }
    }

    private void authenticate(PluginCall call, Cipher cipher, CipherAction onAuthorized) {
        String title = call.getString("title", "Ciclo");
        String subtitle = call.getString("subtitle");
        getActivity().runOnUiThread(() -> {
            BiometricPrompt.PromptInfo.Builder info = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .setAllowedAuthenticators(AUTHENTICATORS);
            if (subtitle != null) info.setSubtitle(subtitle);
            BiometricPrompt prompt = new BiometricPrompt(
                (FragmentActivity) getActivity(),
                ContextCompat.getMainExecutor(getContext()),
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        BiometricPrompt.CryptoObject crypto = result.getCryptoObject();
                        try {
                            if (crypto == null || crypto.getCipher() == null) throw new GeneralSecurityException();
                            onAuthorized.run(crypto.getCipher());
                        } catch (GeneralSecurityException | IOException | ProviderException e) {
                            call.reject("Could not use the key", "KEY_ERROR");
                        }
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        boolean canceled = errorCode == BiometricPrompt.ERROR_USER_CANCELED
                            || errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON
                            || errorCode == BiometricPrompt.ERROR_CANCELED;
                        call.reject("Authentication did not finish", canceled ? "AUTH_CANCELED" : "AUTH_ERROR");
                    }
                }
            );
            prompt.authenticate(info.build(), new BiometricPrompt.CryptoObject(cipher));
        });
    }

    /** Per-use keys that accept a fingerprint or the screen lock need Android 11. */
    private boolean lockAvailable() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
            && BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS) == BiometricManager.BIOMETRIC_SUCCESS;
    }

    private SecretKey freshKey(String alias, boolean requireAuth) throws GeneralSecurityException {
        deleteKey(alias);
        try {
            return generateKey(alias, requireAuth, true);
        } catch (ProviderException e) {
            // StrongBox is missing or does not support this key. Use the TEE instead.
            deleteKey(alias);
            return generateKey(alias, requireAuth, false);
        }
    }

    private SecretKey generateKey(String alias, boolean requireAuth, boolean strongBox) throws GeneralSecurityException {
        KeyGenParameterSpec.Builder spec = new KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256);
        if (strongBox && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            spec.setIsStrongBoxBacked(true);
        }
        if (requireAuth) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) throw new GeneralSecurityException("Needs Android 11");
            spec.setUserAuthenticationRequired(true);
            spec.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG | KeyProperties.AUTH_DEVICE_CREDENTIAL);
        }
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE);
        generator.init(spec.build());
        return generator.generateKey();
    }

    private SecretKey existingKey(String alias) throws GeneralSecurityException, IOException {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
        keyStore.load(null);
        Key key = keyStore.getKey(alias, null);
        return key instanceof SecretKey ? (SecretKey) key : null;
    }

    private void deleteKey(String alias) {
        try {
            KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
            keyStore.load(null);
            if (keyStore.containsAlias(alias)) keyStore.deleteEntry(alias);
        } catch (GeneralSecurityException | IOException e) {
            // Nothing to delete, or the Keystore is unavailable. Either way the key is unusable.
        }
    }

    private void writePhrase(byte mode, byte[] iv, byte[] sealed) throws IOException {
        ByteBuffer buffer = ByteBuffer.allocate(3 + iv.length + sealed.length);
        buffer.put(PHRASE_FORMAT).put(mode).put((byte) iv.length).put(iv).put(sealed);
        write(PHRASE_FILE, buffer.array());
    }

    private AtomicFile atomic(String name) {
        return new AtomicFile(new File(getContext().getFilesDir(), name));
    }

    private byte[] readOrNull(String name) throws IOException {
        try {
            return atomic(name).readFully();
        } catch (FileNotFoundException e) {
            return null;
        }
    }

    private byte[] readOrNullQuietly(String name) {
        try {
            return readOrNull(name);
        } catch (IOException e) {
            return null;
        }
    }

    /** Writes to a temporary file, syncs it, then replaces the old one, so a crash never leaves half a file. */
    private void write(String name, byte[] bytes) throws IOException {
        AtomicFile file = atomic(name);
        FileOutputStream out = file.startWrite();
        try {
            out.write(bytes);
            file.finishWrite(out);
        } catch (IOException e) {
            file.failWrite(out);
            throw e;
        }
    }

    private static void deleteRecursively(File file) {
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) deleteRecursively(child);
        }
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }
}
