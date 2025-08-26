package com.solsol.heycalendar;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.solsol.heycalendar.mapper")
public class HeycalendarApplication {

	public static void main(String[] args) {
		SpringApplication.run(HeycalendarApplication.class, args);
	}

}
