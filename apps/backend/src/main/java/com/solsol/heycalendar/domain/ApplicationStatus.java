package com.solsol.heycalendar.domain;

public enum ApplicationStatus {
    PENDING("pending"),
    APPROVED("approved"), 
    REJECTED("rejected");

    private final String value;

    ApplicationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}