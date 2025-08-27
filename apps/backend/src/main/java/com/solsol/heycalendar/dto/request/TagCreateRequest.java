package com.solsol.heycalendar.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TagCreateRequest {
    /** 태그 여러개 한번에 추가 */
    @NotEmpty private java.util.List<@NotBlank String> tags;
}