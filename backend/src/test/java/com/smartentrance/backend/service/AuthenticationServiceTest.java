package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.auth.LoginRequest;
import com.smartentrance.backend.dto.auth.LoginResponse;
import com.smartentrance.backend.dto.user.UserRegisterRequest;
import com.smartentrance.backend.dto.user.UserResponse;
import com.smartentrance.backend.mapper.UserMapper;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.security.JwtService;
import com.smartentrance.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private InvitationService invitationService;

    @InjectMocks
    private AuthenticationService authenticationService;

    private UserRegisterRequest registerRequest;
    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new UserRegisterRequest();
        registerRequest.setEmail("invitee@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setInvitationCode("ABC123");
        registerRequest.setRememberMe(false);

        user = User.builder()
                .id(1L)
                .email("invitee@example.com")
                .build();

        userResponse = new UserResponse(
                1L,
                "invitee@example.com",
                null,
                null
        );
    }

    @Test
    void register_withValidInvitationCode_acceptsInvitationAndReturnsToken() {

        when(userMapper.toEntity(registerRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("hashed-password");
        when(userService.saveUser(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(UserPrincipal.class), anyBoolean()))
                .thenReturn("jwt-token");
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        LoginResponse response = authenticationService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(userResponse, response.getUser());

        verify(invitationService).acceptInvitation("ABC123", user);
        verify(jwtService).generateToken(any(UserPrincipal.class), eq(false));
    }

    @Test
    void register_withInvalidInvitationCode_stillCreatesUserButThrowsException() {

        when(userMapper.toEntity(registerRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("hashed-password");
        when(userService.saveUser(any(User.class))).thenReturn(user);
        doThrow(new RuntimeException("Invalid invitation"))
                .when(invitationService)
                .acceptInvitation(anyString(), any(User.class));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> authenticationService.register(registerRequest)
        );

        assertEquals("Invalid invitation", ex.getMessage());

        verify(userService).saveUser(any(User.class));
        verify(invitationService).acceptInvitation("ABC123", user);
        verify(jwtService, never()).generateToken(any(), anyBoolean());
    }

    @Test
    void register_withoutInvitationCode_doesNotProcessInvitation() {

        registerRequest.setInvitationCode(null);

        when(userMapper.toEntity(registerRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("hashed-password");
        when(userService.saveUser(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(UserPrincipal.class), anyBoolean()))
                .thenReturn("jwt-token");
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        LoginResponse response = authenticationService.register(registerRequest);

        assertNotNull(response);
        verify(invitationService, never()).acceptInvitation(any(), any());
        verify(jwtService).generateToken(any(UserPrincipal.class), anyBoolean());
    }
    @Test
    void login_successWithoutInvitationCode_generatesToken() {

        LoginRequest loginRequest = new LoginRequest("invitee@example.com", "password123", false, null);

        UserPrincipal principal = new UserPrincipal(user);

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authenticationMock);

        when(jwtService.generateToken(principal, false))
                .thenReturn("jwt-token");

        when(userMapper.toResponse(user)).thenReturn(userResponse);

        LoginResponse response = authenticationService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(userResponse, response.getUser());

        verify(invitationService, never()).acceptInvitation(anyString(), any());
        verify(jwtService).generateToken(principal, false);
    }

    @Test
    void login_successWithInvitationCode_callsAcceptInvitation() {

        LoginRequest loginRequest = new LoginRequest("invitee@example.com", "password123", false, "ABC123");

        UserPrincipal principal = new UserPrincipal(user);

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authenticationMock);

        when(jwtService.generateToken(principal, false))
                .thenReturn("jwt-token");

        when(userMapper.toResponse(user)).thenReturn(userResponse);

        LoginResponse response = authenticationService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(userResponse, response.getUser());

        verify(invitationService).acceptInvitation("ABC123", user);
        verify(jwtService).generateToken(principal, false);
    }

    @Test
    void login_invalidCredentials_throwsBadCredentialsException() {

        LoginRequest loginRequest = new LoginRequest("invitee@example.com", "wrongpassword", false, null);

        when(authenticationManager.authenticate(any()))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        assertThrows(org.springframework.security.authentication.BadCredentialsException.class,
                () -> authenticationService.login(loginRequest));

        verify(jwtService, never()).generateToken(any(), anyBoolean());
        verify(invitationService, never()).acceptInvitation(anyString(), any());
    }

    @Test
    void login_unexpectedPrincipal_throwsIllegalStateException() {

        LoginRequest loginRequest = new LoginRequest("invitee@example.com", "password123", false, null);

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.getPrincipal()).thenReturn("not a UserPrincipal");

        when(authenticationManager.authenticate(any()))
                .thenReturn(authenticationMock);

        assertThrows(IllegalStateException.class,
                () -> authenticationService.login(loginRequest));

        verify(jwtService, never()).generateToken(any(), anyBoolean());
        verify(invitationService, never()).acceptInvitation(anyString(), any());
    }
    @Test
    void getAuthenticatedUser_success_returnsUserResponse() {

        UserPrincipal principal = new UserPrincipal(user);

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.isAuthenticated()).thenReturn(true);
        when(authenticationMock.getPrincipal()).thenReturn(principal);

        SecurityContext securityContextMock = mock(SecurityContext.class);
        when(securityContextMock.getAuthentication()).thenReturn(authenticationMock);
        SecurityContextHolder.setContext(securityContextMock);

        when(userService.getUserById(user.getId())).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse response = authenticationService.getAuthenticatedUser();

        assertNotNull(response);
        assertEquals(userResponse, response);
    }

    @Test
    void getAuthenticatedUser_nullAuthentication_throwsBadCredentialsException() {

        SecurityContext securityContextMock = mock(SecurityContext.class);
        when(securityContextMock.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContextMock);

        assertThrows(BadCredentialsException.class,
                () -> authenticationService.getAuthenticatedUser());
    }

    @Test
    void getAuthenticatedUser_notAuthenticated_throwsBadCredentialsException() {

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.isAuthenticated()).thenReturn(false);

        SecurityContext securityContextMock = mock(SecurityContext.class);
        when(securityContextMock.getAuthentication()).thenReturn(authenticationMock);
        SecurityContextHolder.setContext(securityContextMock);

        assertThrows(BadCredentialsException.class,
                () -> authenticationService.getAuthenticatedUser());
    }

    @Test
    void getAuthenticatedUser_principalNotUserPrincipal_throwsBadCredentialsException() {

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.isAuthenticated()).thenReturn(true);
        when(authenticationMock.getPrincipal()).thenReturn("not a UserPrincipal");

        SecurityContext securityContextMock = mock(SecurityContext.class);
        when(securityContextMock.getAuthentication()).thenReturn(authenticationMock);
        SecurityContextHolder.setContext(securityContextMock);

        assertThrows(BadCredentialsException.class,
                () -> authenticationService.getAuthenticatedUser());
    }

    @Test
    void getAuthenticatedUser_userNotFound_throwsBadCredentialsException() {

        UserPrincipal principal = new UserPrincipal(user);

        Authentication authenticationMock = mock(Authentication.class);
        when(authenticationMock.isAuthenticated()).thenReturn(true);
        when(authenticationMock.getPrincipal()).thenReturn(principal);

        SecurityContext securityContextMock = mock(SecurityContext.class);
        when(securityContextMock.getAuthentication()).thenReturn(authenticationMock);
        SecurityContextHolder.setContext(securityContextMock);

        when(userService.getUserById(user.getId())).thenThrow(new jakarta.persistence.EntityNotFoundException());

        BadCredentialsException ex = assertThrows(BadCredentialsException.class,
                () -> authenticationService.getAuthenticatedUser());

        assertEquals("User session invalid", ex.getMessage());
    }
}
