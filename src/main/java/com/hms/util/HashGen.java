package com.hms.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class HashGen implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "adminpass";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Hashed password: " + encodedPassword);
    }
}
