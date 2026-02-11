package com.example.parcinfo.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RequestMapping("api")
@RestController
@CrossOrigin("*")
public class TestController {

@GetMapping("test")
public String firstFunction(){


    return  "TEST APP";
}
}
