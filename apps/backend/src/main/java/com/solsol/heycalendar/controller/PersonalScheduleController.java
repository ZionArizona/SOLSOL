package com.solsol.heycalendar.controller;


import com.solsol.heycalendar.dto.request.CreatePersonalScheduleRequest;
import com.solsol.heycalendar.dto.request.PersonalScheduleFetchRequest;
import com.solsol.heycalendar.dto.response.PersonalScheduleListResponse;
import com.solsol.heycalendar.dto.response.PersonalScheduleResponse;
import com.solsol.heycalendar.service.PersonalScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class PersonalScheduleController {

    private final PersonalScheduleService service;

    @PostMapping("/events")
    public ResponseEntity<?> create(@RequestBody CreatePersonalScheduleRequest req) {
        service.create(req);
        return ResponseEntity.status(201).body(Map.of("success", true));
    }


    @PostMapping
    public ResponseEntity<PersonalScheduleListResponse> list(@Valid @RequestBody PersonalScheduleFetchRequest req) {
        System.out.println("come to get List of PersonalUser Schedule");
        List<PersonalScheduleResponse> list = service.findByUserNm(req.getUserNm());
        return ResponseEntity.ok(
                PersonalScheduleListResponse.builder()
                        .userNm(req.getUserNm())
                        .count(list.size())
                        .schedules(list)
                        .build()
        );
    }

}