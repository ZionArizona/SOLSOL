package com.solsol.heycalendar.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Getter;


@Getter
@Component
@ConfigurationProperties(prefix = "apps.security")
public class JwtProperties {

	private final Jwt jwt = new Jwt();
	private final Cors cors = new Cors();

	@Getter
	public static class Jwt {
		private String issuer;
		private String secret;
		private int accessExpMin;
		private int refreshExpDays;
		private String tokenPrefix;
		private String headerString;


		public void setIssuer(String s) { this.issuer = s; }
		public void setSecret(String s) { this.secret = s; }
		public void setAccessExpMin(int v) { this.accessExpMin = v; }
		public void setRefreshExpDays(int v) { this.refreshExpDays = v; }
		public void setTokenPrefix(String s) { this.tokenPrefix = s; }
		public void setHeaderString(String s) { this.headerString = s; }

		public String getNormalizedTokenPrefix() {
			return tokenPrefix == null ? "" : tokenPrefix.trim();
		}
	}

	@Getter
	public static class Cors {
		private String allowedOrigins;
		public void setAllowedOrigins(String s) { this.allowedOrigins = s; }
	}
}
