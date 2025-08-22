package com.solsol.heycalendar.domain;

public enum EligibilityOperator {
	GREATER_THAN_OR_EQUAL(">="),
	LESS_THAN_OR_EQUAL("<="),
	EQUAL("=="),
	GREATER_THAN(">"),
	LESS_THAN("<");
	
	private final String symbol;
	
	EligibilityOperator(String symbol) {
		this.symbol = symbol;
	}
	
	public String getSymbol() {
		return symbol;
	}
}