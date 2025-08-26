package com.solsol.heycalendar.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "apps.security")
public class JwtProperties {

	private Jwt jwt = new Jwt();
	private Cors cors = new Cors();

	@Getter
	@Setter
	public static class Jwt {
		private String issuer;
		private String secret;
		private int accessExpMin;
		private int refreshExpDays;
		private String tokenPrefix;
		private String headerString;

		public String getNormalizedTokenPrefix() {
			return tokenPrefix == null ? "" : tokenPrefix.trim();
		}
	}

	@Getter
	@Setter
	public static class Cors {
		private String allowedOrigins;
	}
}
