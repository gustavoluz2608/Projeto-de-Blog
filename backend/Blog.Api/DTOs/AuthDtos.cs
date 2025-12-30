namespace Blog.Api.DTOs;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token,
    DateTime ExpiresAtUtc,
    UserMe User
);

public record UserMe(
    string Id,
    string Email,
    string[] Roles
);
