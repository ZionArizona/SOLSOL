package com.solsol.heycalendar.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReorderRequest {
    /** 새 정렬 순서대로의 ID 목록 */
    @NotEmpty private java.util.List<Long> ids;
}