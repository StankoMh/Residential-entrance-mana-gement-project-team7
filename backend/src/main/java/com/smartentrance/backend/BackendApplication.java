package com.smartentrance.backend;

import com.smartentrance.backend.config.FileStorageProperties;
import com.smartentrance.backend.payment.StripeProperties;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableConfigurationProperties({StripeProperties.class, FileStorageProperties.class})
@EnableScheduling
@EnableAsync
public class BackendApplication {

	static void main(String[] args) {
		// Load .env file before Spring Boot initializes
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		dotenv.entries().forEach(entry ->
			System.setProperty(entry.getKey(), entry.getValue())
		);

		SpringApplication.run(BackendApplication.class, args);
	}
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
}
