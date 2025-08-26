package com.solsol.heycalendar.service.crypto;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * AES/GCM/NoPadding 알고리즘을 사용하여 데이터를 암호화하고 복호화하는 서비스 클래스입니다.
 * 이 클래스는 {@link CryptoService} 인터페이스를 구현합니다.
 */
@Service  // 스프링 빈 등록 → @Autowired 또는 생성자 주입 가능
public class AesGcmCryptoService implements CryptoService {

	private static final String ALGORITHM = "AES/GCM/NoPadding";
	private static final int TAG_LENGTH_BIT = 128;
	private static final int IV_LENGTH_BYTE = 12;

	private final byte[] secretKey;

	/**
	 * AesGcmCryptoService 생성자.
	 * application.yml 또는 환경 변수로부터 32바이트(256비트)의 암호화 키를 주입받습니다.
	 *
	 * @param secretKeyBase64 Base64로 인코딩된 32바이트 암호화 키
	 */
	public AesGcmCryptoService(@Value("${solsol.crypto.secret-key-base64}") String secretKeyBase64) {
		// TODO: 주입받은 키가 32바이트가 맞는지 검증하는 로직 추가
		this.secretKey = java.util.Base64.getDecoder().decode(secretKeyBase64);
	}

	/**
	 * 주어진 평문 문자열을 AES/GCM 알고리즘으로 암호화합니다.
	 * 암호화된 결과는 [IV (12바이트)][암호문] 형태로 반환됩니다.
	 *
	 * @param plainText 암호화할 평문 문자열
	 * @return 암호화된 데이터 바이트 배열
	 * @throws IllegalStateException 암호화 과정에서 오류 발생 시
	 */
	@Override
	public byte[] encryptToBytes(String plainText) {
		if (plainText == null) {
			return null;
		}
		try {
			byte[] iv = new byte[IV_LENGTH_BYTE];
			new SecureRandom().nextBytes(iv);

			final Cipher cipher = Cipher.getInstance(ALGORITHM);
			GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
			SecretKeySpec keySpec = new SecretKeySpec(secretKey, "AES");
			cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmParameterSpec);

			byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
			byte[] result = new byte[iv.length + cipherText.length];

			System.arraycopy(iv, 0, result, 0, iv.length);
			System.arraycopy(cipherText, 0, result, iv.length, cipherText.length);

			return result;
		} catch (Exception e) {
			throw new IllegalStateException("AES-GCM 암호화 중 오류가 발생했습니다.", e);
		}
	}


	/**
	 * AES/GCM으로 암호화된 데이터를 평문 문자열로 복호화합니다.
	 * 입력 데이터는 [IV (12바이트)][암호문] 형태로 구성되어 있어야 합니다.
	 *
	 * @param cipherData 복호화할 암호화된 데이터 바이트 배열
	 * @return 복호화된 평문 문자열
	 * @throws IllegalStateException 복호화 과정에서 오류 발생 시
	 */
	@Override
	public String decryptToString(byte[] cipherData) {
		if (cipherData == null) {
			return null;
		}
		try {
			byte[] iv = new byte[IV_LENGTH_BYTE];
			System.arraycopy(cipherData, 0, iv, 0, IV_LENGTH_BYTE);

			byte[] cipherText = new byte[cipherData.length - IV_LENGTH_BYTE];
			System.arraycopy(cipherData, IV_LENGTH_BYTE, cipherText, 0, cipherText.length);

			final Cipher cipher = Cipher.getInstance(ALGORITHM);
			GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
			SecretKeySpec keySpec = new SecretKeySpec(secretKey, "AES");
			cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmParameterSpec);

			byte[] decryptedText = cipher.doFinal(cipherText);
			return new String(decryptedText, StandardCharsets.UTF_8);
		} catch (Exception e) {
			throw new IllegalStateException("AES-GCM 복호화 중 오류가 발생했습니다.", e);
		}
	}
}
