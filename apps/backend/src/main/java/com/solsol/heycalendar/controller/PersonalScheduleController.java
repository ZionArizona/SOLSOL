package com.solsol.heycalendar.controller;


import com.solsol.heycalendar.dto.request.CreatePersonalScheduleRequest;
import com.solsol.heycalendar.service.PersonalScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class PersonalScheduleController {

    private final PersonalScheduleService service;

    @PostMapping("/events")
    public ResponseEntity<?> create(@RequestBody CreatePersonalScheduleRequest req) {
        service.create(req);
        return ResponseEntity.ok().build();
    }
}