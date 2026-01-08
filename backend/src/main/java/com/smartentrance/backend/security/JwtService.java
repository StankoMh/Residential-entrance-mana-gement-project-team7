package com.smartentrance.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private Long shortExpiration;

    @Value("${application.security.jwt.remember-me.expiration}")
    private Long rememberMeExpiration;

    @Value("${application.security.jwt.cookie-name}")
    private String cookieName;

    @Value("${application.security.jwt.secure-cookie}")
    private boolean secureCookie;

    private SecretKey cachedKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.cachedKey = Keys.hmacShaKeyFor(keyBytes);
    }


    public ResponseCookie generateCookie(String token, boolean rememberMe) {
        long maxAge = rememberMe ? rememberMeExpiration : shortExpiration;

        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(maxAge / 1000)
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie getCleanCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(0)
                .build();
    }

    public String generateToken(UserPrincipal userPrincipal, boolean rememberMe) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("role", userPrincipal.user().getRole().name());
        claims.put("id", userPrincipal.user().getId());

        long expirationTime = rememberMe ? rememberMeExpiration : shortExpiration;

        return buildToken(claims, userPrincipal.getUsername(), expirationTime);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, Long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsername(Claims claims) {
        return claims.getSubject();
    }

    public String getRole(Claims claims) {
        return claims.get("role", String.class);
    }

    public Long getUserId(Claims claims) {
        return claims.get("id", Long.class);
    }

    public Date getIssuedAt(Claims claims) {
        return claims.getIssuedAt();
    }

    private SecretKey getSignInKey() {
        return cachedKey;
    }
}