package com.solsol.heycalendar.service.crypto;

import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service  // 스프링 빈 등록 → @Autowired 또는 생성자 주입 가능
@RequiredArgsConstructor
public class AesGcmCryptoService implements CryptoService {

	private static final String ALG = "AES/GCM/NoPadding";
	private static final int TAG_LEN = 128;
	private static final int IV_LEN = 12;
	private final byte[] secretKey = new byte[32]; // TODO: application.properties에서 주입받는게 바람직

	@Override
	public byte[] encryptToBytes(String plain) {
		try {
			byte[] iv = new byte[IV_LEN];
			new SecureRandom().nextBytes(iv);

			Cipher cipher = Cipher.getInstance(ALG);
			cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(secretKey, "AES"), new GCMParameterSpec(TAG_LEN, iv));
			byte[] ct = cipher.doFinal(plain.getBytes());

			byte[] out = new byte[iv.length + ct.length];
			System.arraycopy(iv, 0, out, 0, iv.length);
			System.arraycopy(ct, 0, out, iv.length, ct.length);
			return out;
		} catch (Exception e) {
			throw new IllegalStateException("AES-GCM encryption error", e);
		}
	}

	@Override
	public String decryptToString(byte[] cipherPacked) {
		try {
			byte[] iv = new byte[IV_LEN];
			byte[] ct = new byte[cipherPacked.length - IV_LEN];
			System.arraycopy(cipherPacked, 0, iv, 0, IV_LEN);
			System.arraycopy(cipherPacked, IV_LEN, ct, 0, ct.length);

			Cipher cipher = Cipher.getInstance(ALG);
			cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(secretKey, "AES"), new GCMParameterSpec(TAG_LEN, iv));
			return new String(cipher.doFinal(ct));
		} catch (Exception e) {
			throw new IllegalStateException("AES-GCM decryption error", e);
		}
	}
}
