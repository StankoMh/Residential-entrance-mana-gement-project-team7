package com.smartentrance.backend.security;

import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenRevocationService revocationService;

    @Value("${application.security.jwt.cookie-name}")
    private String cookieName;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String jwt = null;

        if (request.getCookies() != null) {
            Cookie cookie = WebUtils.getCookie(request, cookieName);
            if (cookie != null) {
                jwt = cookie.getValue();
            }
        }

        if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtService.validateAndGetClaims(jwt);
                
                Date issuedAt = jwtService.getIssuedAt(claims);
                Long userId = jwtService.getUserId(claims);

                if (revocationService.isTokenRevoked(userId, issuedAt.getTime() / 1000)) {
                    response.addHeader(HttpHeaders.SET_COOKIE, jwtService.getCleanCookie().toString());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                } else {
                    String userEmail = jwtService.getUsername(claims);
                    String roleString = jwtService.getRole(claims);

                    User user = new User();
                    user.setId(userId);
                    user.setEmail(userEmail);
                    user.setRole(UserRole.valueOf(roleString));

                    UserPrincipal userPrincipal = new UserPrincipal(user);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userPrincipal,
                            null,
                            userPrincipal.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (JwtException | IllegalArgumentException e) {
                response.addHeader(HttpHeaders.SET_COOKIE, jwtService.getCleanCookie().toString());
            }
        }

        filterChain.doFilter(request, response);
    }
}