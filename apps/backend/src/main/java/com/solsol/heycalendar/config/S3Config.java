package com.solsol.heycalendar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3Config {
	@Bean
	public S3Client s3Client() {
		return S3Client.builder()
			.region(Region.of(System.getProperty("aws.region", "ap-northeast-2")))
			.credentialsProvider(DefaultCredentialsProvider.create())
			.build();
	}

	@Bean
	public S3Presigner s3Presigner() {
		return S3Presigner.builder()
			.region(Region.of(System.getProperty("aws.region", "ap-northeast-2")))
			.credentialsProvider(DefaultCredentialsProvider.create())
			.build();
	}
}
