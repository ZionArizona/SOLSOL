package com.solsol.heycalendar.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // JWT 보안 스키마 정의
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        // 보안 요구사항 정의
        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("bearerAuth");

        return new OpenAPI()
                .info(new Info()
                        .title("SOLSOL API")
                        .description("SOLSOL 장학금 관리 시스템 API 문서")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SOLSOL Team")
                                .email("team@solsol.com")
                                .url("https://github.com/ZionArizona/SOLSOL"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("개발 서버"),
                        new Server().url("https://api.solsol.com").description("운영 서버")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", securityScheme))
                .security(List.of(securityRequirement));
    }
}