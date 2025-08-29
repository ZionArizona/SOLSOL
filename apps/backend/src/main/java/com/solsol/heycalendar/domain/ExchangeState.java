package com.solsol.heycalendar.domain;

/**
 * Exchange request state enumeration
 */
public enum ExchangeState {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED");

    private final String value;

    ExchangeState(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ExchangeState fromValue(String value) {
        for (ExchangeState state : ExchangeState.values()) {
            if (state.value.equals(value)) {
                return state;
            }
        }
        throw new IllegalArgumentException("Unknown exchange state: " + value);
    }
}
