package com.solsol.heycalendar.service.crypto;

public interface CryptoService {
	byte[] encryptToBytes(String plain);

	String decryptToString(byte[] cipher);
}
